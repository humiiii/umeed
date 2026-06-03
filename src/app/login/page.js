import LoginForm from './LoginForm';

export const metadata = {
  title: 'Unlock - Umeed',
  description: 'Unlock your personal social media posting tool.',
};

export default function LoginPage() {
  // Check on server if admin password has been set up in environment variables
  const isConfigured = !!process.env.ADMIN_PASSWORD;

  return (
    <div className="login-wrapper">
      <LoginForm isConfigured={isConfigured} />
    </div>
  );
}
