from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..db.database import Base


class UserRole(str, enum.Enum):
    READER = "reader"
    AUTHOR = "author"
    ADMIN = "admin"


class BookStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    DRAFT = "draft"


class AccessType(str, enum.Enum):
    FREE = "free"
    RENT_24H = "rent_24h"
    RENT_7D = "rent_7d"
    RENT_30D = "rent_30d"
    PURCHASE = "purchase"


class PaymentMethod(str, enum.Enum):
    MONCASH = "moncash"
    STRIPE = "stripe"
    STARS = "stars"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.READER, nullable=False)
    is_author = Column(Boolean, default=False, nullable=False)
    stars_balance = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # Relationships
    books = relationship("Book", back_populates="author_user", foreign_keys="Book.author_id")
    accesses = relationship("BookAccess", back_populates="user")
    star_transactions = relationship("StarTransaction", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    quizzes = relationship("QuizAttempt", back_populates="user")


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False, index=True)
    author = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, index=True)
    language = Column(String(10), default="fr", nullable=False)
    isbn = Column(String(20), nullable=True, unique=True)
    publication_year = Column(Integer, nullable=True)
    publisher = Column(String(255), nullable=True)
    page_count = Column(Integer, nullable=True)
    
    # Files
    cover_url = Column(String(500), nullable=True)
    pdf_url = Column(String(500), nullable=True)
    pdf_file_size = Column(Integer, nullable=True)  # in bytes
    
    # Access
    access_type = Column(Enum(AccessType), default=AccessType.FREE, nullable=False)
    stars_required = Column(Integer, default=0, nullable=True)
    price_gourdes = Column(Float, nullable=True)
    price_usd = Column(Float, nullable=True)
    
    # Status
    status = Column(Enum(BookStatus), default=BookStatus.PENDING, nullable=False, index=True)
    rejection_reason = Column(Text, nullable=True)
    
    # Author
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Metadata
    view_count = Column(Integer, default=0, nullable=False)
    download_count = Column(Integer, default=0, nullable=False)
    average_rating = Column(Float, default=0.0, nullable=False)
    review_count = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    author_user = relationship("User", back_populates="books", foreign_keys=[author_id])
    accesses = relationship("BookAccess", back_populates="book")
    reviews = relationship("Review", back_populates="book")
    quizzes = relationship("Quiz", back_populates="book", uselist=False)
    copyright_claims = relationship("CopyrightClaim", back_populates="book")


class BookAccess(Base):
    __tablename__ = "book_access"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False, index=True)
    access_type = Column(Enum(AccessType), nullable=False)
    payment_method = Column(Enum(PaymentMethod), nullable=True)
    amount_paid = Column(Float, nullable=True)
    stars_used = Column(Integer, default=0, nullable=True)
    
    granted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    user = relationship("User", back_populates="accesses")
    book = relationship("Book", back_populates="accesses")


class StarTransaction(Base):
    __tablename__ = "star_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Integer, nullable=False)  # can be negative for spending
    balance_after = Column(Integer, nullable=False)
    transaction_type = Column(String(50), nullable=False)  # quiz_reward, purchase, gift, etc.
    description = Column(String(500), nullable=True)
    reference_id = Column(Integer, nullable=True)  # quiz_id, book_id, etc.
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="star_transactions")


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), unique=True, nullable=False)
    total_questions = Column(Integer, nullable=False)
    passing_score = Column(Integer, default=70, nullable=False)  # percentage
    stars_reward = Column(Integer, default=5, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # Relationships
    book = relationship("Book", back_populates="quizzes")
    questions = relationship("QuizQuestion", back_populates="quiz", cascade="all, delete-orphan")
    attempts = relationship("QuizAttempt", back_populates="quiz")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    option_a = Column(String(500), nullable=False)
    option_b = Column(String(500), nullable=False)
    option_c = Column(String(500), nullable=False)
    option_d = Column(String(500), nullable=False)
    correct_answer = Column(String(1), nullable=False)  # 'A', 'B', 'C', or 'D'
    difficulty = Column(String(20), default="medium", nullable=False)  # easy, medium, hard
    points = Column(Integer, default=1, nullable=False)
    
    order = Column(Integer, nullable=False)

    # Relationships
    quiz = relationship("Quiz", back_populates="questions")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False, index=True)
    score = Column(Integer, nullable=False)  # percentage
    passed = Column(Boolean, nullable=False)
    stars_earned = Column(Integer, default=0, nullable=False)
    answers = Column(Text, nullable=True)  # JSON string of answers
    
    completed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="quizzes")
    quiz = relationship("Quiz", back_populates="attempts")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)
    is_approved = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # Relationships
    user = relationship("User", back_populates="reviews")
    book = relationship("Book", back_populates="reviews")


class CopyrightClaim(Base):
    __tablename__ = "copyright_claims"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False, index=True)
    claimant_name = Column(String(255), nullable=False)
    claimant_email = Column(String(255), nullable=False)
    claim_reason = Column(Text, nullable=False)
    supporting_documents = Column(Text, nullable=True)  # JSON array of URLs
    status = Column(String(50), default="pending", nullable=False)  # pending, investigating, resolved, rejected
    resolution_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    book = relationship("Book", back_populates="copyright_claims")
