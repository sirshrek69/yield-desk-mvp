# Authentication Setup Guide

This guide will help you set up Privy authentication and Supabase for the Yield Desk platform.

## 1. Privy Setup

### Create a Privy Account
1. Go to [https://dashboard.privy.io](https://dashboard.privy.io)
2. Sign up or log in to your account
3. Create a new app for Yield Desk

### Configure Privy App
1. In your Privy dashboard, go to "Settings" > "General"
2. Note down your **App ID** and **App Secret**
3. Configure login methods:
   - Enable Email
   - Enable Wallet (MetaMask, WalletConnect, etc.)
   - Enable SMS (optional)
4. Set up embedded wallets for users without existing wallets

### Environment Variables
Add these to your `.env.local` file:
```bash
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
PRIVY_APP_SECRET=your_privy_app_secret_here
```

## 2. Supabase Setup

### Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and API keys

### Set Up Database Schema
1. In your Supabase dashboard, go to "SQL Editor"
2. Run the SQL commands from `supabase-schema.sql` to create the necessary tables:
   - `user_profiles` - Store user information
   - `portfolio_positions` - Store user investments
   - `wallet_balances` - Store user wallet balances

### Environment Variables
Add these to your `.env.local` file:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## 3. WalletConnect Setup (Optional)

### Create WalletConnect Project
1. Go to [https://cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Create a new project
3. Get your Project ID

### Environment Variables
Add this to your `.env.local` file:
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

## 4. Install Dependencies

Run the following command to install the required packages:

```bash
npm install @privy-io/react-auth @privy-io/wagmi @supabase/supabase-js @supabase/auth-helpers-nextjs wagmi viem @tanstack/react-query --legacy-peer-deps
```

## 5. Features Included

### Authentication
- **Wallet Connection**: Support for MetaMask, WalletConnect, Coinbase Wallet
- **Email Login**: Traditional email/password authentication
- **SMS Login**: Phone number verification
- **Embedded Wallets**: Auto-create wallets for users without existing ones

### User Management
- **User Profiles**: Store user information and KYC status
- **Portfolio Tracking**: Track investments across different asset classes
- **Wallet Balance**: Manage user wallet balances
- **Real-time Sync**: Automatic synchronization between Privy and Supabase

### Security
- **Row Level Security**: Supabase RLS policies ensure users can only access their own data
- **JWT Tokens**: Secure authentication using Privy's JWT tokens
- **Encrypted Storage**: All sensitive data is encrypted in Supabase

## 6. Usage

### Authentication Flow
1. User clicks "Connect Wallet" button
2. Privy modal opens with login options
3. User authenticates via wallet, email, or SMS
4. User data is synced to Supabase
5. User can access their dashboard and portfolio

### Portfolio Management
- Portfolio data is stored in Supabase instead of localStorage
- Real-time updates across all devices
- Persistent data that survives browser clears

### Account Dashboard
- View user profile information
- Track portfolio performance
- Monitor wallet balance
- KYC status and verification

## 7. File Structure

```
src/
├── components/
│   ├── PrivyProvider.tsx      # Privy authentication provider
│   ├── AuthButton.tsx         # Login/logout button
│   └── UserDashboard.tsx      # User account dashboard
├── contexts/
│   └── AuthContext.tsx        # Authentication context
├── lib/
│   └── supabase.ts            # Supabase client configuration
└── app/
    ├── account/
    │   └── page.tsx           # Account dashboard page
    └── layout.tsx             # Updated with auth providers
```

## 8. Next Steps

1. Set up your Privy and Supabase accounts
2. Add environment variables to `.env.local`
3. Install dependencies
4. Run the database schema setup
5. Test the authentication flow
6. Customize the UI components as needed

## Support

For issues or questions:
- Privy Documentation: [https://docs.privy.io](https://docs.privy.io)
- Supabase Documentation: [https://supabase.com/docs](https://supabase.com/docs)
- WalletConnect Documentation: [https://docs.walletconnect.com](https://docs.walletconnect.com)
