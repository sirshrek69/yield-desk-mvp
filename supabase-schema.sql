-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  privy_id TEXT UNIQUE NOT NULL,
  email TEXT,
  wallet_address TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create portfolio_positions table
CREATE TABLE IF NOT EXISTS portfolio_positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_category TEXT NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  price DECIMAL(18, 8) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('committed', 'active', 'matured'))
);

-- Create wallet_balances table
CREATE TABLE IF NOT EXISTS wallet_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  balance_usd DECIMAL(18, 2) DEFAULT 10000.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_privy_id ON user_profiles(privy_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_wallet_address ON user_profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_portfolio_positions_user_id ON portfolio_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_positions_product_id ON portfolio_positions(product_id);
CREATE INDEX IF NOT EXISTS idx_wallet_balances_user_id ON wallet_balances(user_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_balances ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.jwt() ->> 'sub' = privy_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.jwt() ->> 'sub' = privy_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = privy_id);

-- Create RLS policies for portfolio_positions
CREATE POLICY "Users can view their own portfolio" ON portfolio_positions
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE privy_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can insert their own portfolio positions" ON portfolio_positions
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE privy_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can update their own portfolio positions" ON portfolio_positions
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE privy_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can delete their own portfolio positions" ON portfolio_positions
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE privy_id = auth.jwt() ->> 'sub'
    )
  );

-- Create RLS policies for wallet_balances
CREATE POLICY "Users can view their own wallet balance" ON wallet_balances
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE privy_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can update their own wallet balance" ON wallet_balances
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE privy_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can insert their own wallet balance" ON wallet_balances
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE privy_id = auth.jwt() ->> 'sub'
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallet_balances_updated_at 
  BEFORE UPDATE ON wallet_balances 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
