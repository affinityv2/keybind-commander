/*
  # Create user data tables for Azeroth Keybinds

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `selected_class` (text, default 'mage')
      - `selected_spec` (text, default 'frost')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `keybinds`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `slot_key` (text, e.g. "0-0", "1-5")
      - `label` (text, e.g. "Q", "S+1")
      - `created_at` (timestamp)
    - `assignments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `class_id` (text)
      - `spec_id` (text)
      - `slot_key` (text)
      - `spell_id` (text)
      - `created_at` (timestamp)
    - `custom_spells`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `spell_id` (text, unique per user)
      - `name` (text)
      - `icon` (text)
      - `categories` (jsonb, default '[]')
      - `wowhead_spell_id` (integer, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can only read/write their own data
    - All policies restrict to authenticated users where user_id = auth.uid()

  3. Important Notes
    - profiles.id references auth.users(id) with ON DELETE CASCADE
    - unique constraints on (user_id, slot_key) for keybinds
    - unique constraints on (user_id, class_id, spec_id, slot_key) for assignments
    - unique constraints on (user_id, spell_id) for custom_spells
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_class text NOT NULL DEFAULT 'mage',
  selected_spec text NOT NULL DEFAULT 'frost',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS keybinds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slot_key text NOT NULL,
  label text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, slot_key)
);

CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id text NOT NULL,
  spec_id text NOT NULL,
  slot_key text NOT NULL,
  spell_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, class_id, spec_id, slot_key)
);

CREATE TABLE IF NOT EXISTS custom_spells (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  spell_id text NOT NULL,
  name text NOT NULL,
  icon text NOT NULL,
  categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  wowhead_spell_id integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, spell_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE keybinds ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_spells ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Keybinds policies
CREATE POLICY "Users can read own keybinds"
  ON keybinds FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own keybinds"
  ON keybinds FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own keybinds"
  ON keybinds FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own keybinds"
  ON keybinds FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Assignments policies
CREATE POLICY "Users can read own assignments"
  ON assignments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own assignments"
  ON assignments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own assignments"
  ON assignments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own assignments"
  ON assignments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Custom spells policies
CREATE POLICY "Users can read own custom spells"
  ON custom_spells FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own custom spells"
  ON custom_spells FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own custom spells"
  ON custom_spells FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own custom spells"
  ON custom_spells FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_keybinds_user ON keybinds(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_user ON assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_spells_user ON custom_spells(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class_spec ON assignments(user_id, class_id, spec_id);
