# Supabase Database Setup Instructions

Follow these steps to configure your Supabase database for the Fastpay application.

## Prerequisites

1. Log in to the Supabase dashboard at [supabase.com](https://supabase.com)
2. Navigate to your project using the provided URL: `https://jcdwsviftdjcmpdzwvnh.supabase.co`

## Step 1: Create the Accounts Table

In the SQL Editor, execute the following SQL to create the accounts table:

```sql
-- Create accounts table
CREATE TABLE accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    account_number TEXT UNIQUE NOT NULL,
    balance NUMERIC DEFAULT 0 NOT NULL,
    transactions JSONB DEFAULT '[]'::jsonb,
    loans JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_account_number ON accounts(account_number);
```

## Step 2: Enable Row Level Security (RLS)

```sql
-- Enable RLS on accounts table
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view their own account" ON accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own account" ON accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own account" ON accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own account" ON accounts
    FOR DELETE USING (auth.uid() = user_id);
```

## Step 3: Create Triggers for Auto-updating Timestamps

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_accounts_updated_at 
    BEFORE UPDATE ON accounts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## Step 4: Create Function for Generating Unique Account Numbers

```sql
-- Function to generate unique 10-digit account numbers
CREATE OR REPLACE FUNCTION generate_account_number()
RETURNS TEXT AS $$
DECLARE
    account_num TEXT;
    is_unique BOOLEAN := FALSE;
BEGIN
    WHILE NOT is_unique LOOP
        -- Generate random 10-digit number
        account_num := LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0');
        
        -- Check if it's unique
        SELECT NOT EXISTS(SELECT 1 FROM accounts WHERE account_number = account_num) INTO is_unique;
    END LOOP;
    
    RETURN account_num;
END;
$$ LANGUAGE plpgsql;
```

## Step 5: Set up Google OAuth (Optional)

1. Go to Authentication > Providers in your Supabase dashboard
2. Enable Google provider
3. Add your Google Client ID and Secret from Google Cloud Console
4. Set the redirect URL to: `https://your-domain.com/auth/callback`

### To get Google OAuth credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `https://jcdwsviftdjcmpdzwvnh.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for development)

## Step 6: Enable Realtime (Optional)

```sql
-- Enable realtime for accounts table
ALTER PUBLICATION supabase_realtime ADD TABLE accounts;
```

## Step 7: Test the Setup

You can test your setup by running these queries:

```sql
-- Test account number generation
SELECT generate_account_number();

-- Test inserting a sample account (replace with actual user_id)
INSERT INTO accounts (user_id, account_number, balance) 
VALUES ('your-user-id-here', generate_account_number(), 1000.00);

-- Test querying accounts
SELECT * FROM accounts;
```

## Environment Variables

Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jcdwsviftdjcmpdzwvnh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZHdzdmlmdGRqY21wZHp3dm5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMzY1NzMsImV4cCI6MjA3MTgxMjU3M30.h57QkgMSiEhPffxtnpPHXv3abYcGWJE1dHhK--tW5ZY
```

## Troubleshooting

### Common Issues:

1. **RLS Policies**: Make sure RLS is enabled and policies are correctly set up
2. **User Authentication**: Ensure users are properly authenticated before accessing accounts
3. **JSONB Columns**: Transactions and loans are stored as JSONB arrays
4. **Unique Constraints**: Account numbers must be unique across all accounts

### Testing Locally:

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Visit `http://localhost:3000` to test the application.

## Security Notes

- Never expose your service role key in client-side code
- Always use RLS policies to protect user data
- Validate all inputs on both client and server side
- Use HTTPS in production
- Regularly rotate your API keys

## Support

If you encounter any issues:

1. Check the Supabase logs in your dashboard
2. Verify your environment variables
3. Ensure your database schema matches the expected structure
4. Test your RLS policies with different user scenarios

