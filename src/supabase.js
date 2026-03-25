import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://zfwztymtalzcabuqgpgp.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpmd3p0eW10YWx6Y2FidXFncGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0Nzg1OTAsImV4cCI6MjA5MDA1NDU5MH0.qlED_v6H407F0QRPlgt3lVPL13mDRtkUTJ35IXZj98Q"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)