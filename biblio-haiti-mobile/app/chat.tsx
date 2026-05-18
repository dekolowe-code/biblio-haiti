import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Send, MessageCircle, RefreshCw } from 'lucide-react-native';
import { sendChatMessage, getLibraryContext, type Message } from '../src/lib/aiService';

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Initialiser le contexte de l'assistant
  useEffect(() => {
    getLibraryContext().then(ctx => {
      setContext(ctx);
      setMessages([
        { role: 'assistant', content: 'Bonjour ! Je suis l\'assistant IA de Biblio-Haiti. Je connais tous les livres du catalogue. Comment puis-je vous aider aujourd\'hui ?' }
      ]);
    });
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Construire la conversation complète avec le contexte "system"
      const conversation: Message[] = [
        { role: 'system', content: context },
        ...newMessages
      ];
      
      const response = await sendChatMessage(conversation);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Oups, une erreur s'est produite lors de la connexion à l'IA." }]);
    } finally {
      setIsLoading(false);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  const clearChat = () => {
    Alert.alert('Réinitialiser', 'Voulez-vous effacer la conversation ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Oui', onPress: () => {
        setMessages([
          { role: 'assistant', content: 'Bonjour ! Je suis l\'assistant IA de Biblio-Haiti. Comment puis-je vous aider aujourd\'hui ?' }
        ]);
      }}
    ]);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-background"
    >
      {/* Header */}
      <View className="pt-12 pb-3 px-4 flex-row items-center justify-between border-b border-gray-100 bg-white">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.replace('/')} className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center">
            <ArrowLeft size={20} color="#1A1A2E" />
          </Pressable>
          <View>
            <Text className="font-poppins font-bold text-base text-[#1A1A2E]">Assistant IA</Text>
            <Text className="text-[10px] text-green-500 font-inter font-semibold uppercase">En ligne • Mistral AI</Text>
          </View>
        </View>
        <Pressable onPress={clearChat} className="p-2 bg-gray-50 rounded-full">
          <RefreshCw size={16} color="#6B7280" />
        </Pressable>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        className="flex-1 px-4 py-4 bg-[#FFF8F0]"
        contentContainerStyle={{ paddingBottom: 20 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <View 
              key={idx}
              className={`max-w-[85%] p-4 rounded-2xl mb-4 ${
                isUser 
                  ? 'bg-warning self-end rounded-br-none elevation-xs' 
                  : 'bg-white border border-gray-100 self-start rounded-bl-none elevation-xs'
              }`}
            >
              <Text className={`text-sm font-inter leading-relaxed ${isUser ? 'text-white' : 'text-gray-800'}`}>
                {msg.content}
              </Text>
            </View>
          );
        })}
        
        {isLoading && (
          <View className="bg-white border border-gray-100 self-start p-3 rounded-2xl rounded-bl-none elevation-xs flex-row items-center gap-2 mb-4">
            <ActivityIndicator size="small" color="#FAA307" />
            <Text className="text-gray-500 text-xs font-inter">L'assistant écrit...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View className="p-4 bg-white border-t border-gray-100 flex-row gap-2 items-center">
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Posez une question sur nos livres..."
          className="flex-1 h-12 bg-gray-50 border border-gray-200 rounded-full px-5 text-sm font-inter text-[#1A1A2E]"
          placeholderTextColor="#6B7280"
          editable={!isLoading}
          onSubmitEditing={handleSend}
        />
        <Pressable
          onPress={handleSend}
          disabled={!input.trim() || isLoading}
          className="w-12 h-12 rounded-full bg-warning items-center justify-center elevation-sm"
          style={({ pressed }) => [{ opacity: pressed || !input.trim() || isLoading ? 0.6 : 1 }]}
        >
          <Send size={18} color="white" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
