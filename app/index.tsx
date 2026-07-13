import { Redirect } from 'expo-router';
import { session } from '../lib/session';

export default function Index() {
  return <Redirect href={session.user ? '/home' : '/onboarding'} />;
}
