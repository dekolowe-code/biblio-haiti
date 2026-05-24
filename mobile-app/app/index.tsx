import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

export default function Index() {
  const { loading } = useAuth();

  if (loading) return <Spinner fullScreen />;

  return <Redirect href="/(tabs)/home" />;
}
