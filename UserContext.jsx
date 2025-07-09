// UserContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const UserContext = createContext({
  user: null,
  plan: 'free',
  usage: {},
  loading: false,
  signup: async () => {},
  login: async () => {},
  logout: async () => {},
  getToken: async () => null,
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState('free');
  const [usage, setUsage] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchUserData = async (user) => {
    try {
      if (!user) return;
      const { data: userData } = await supabase
        .from('users')
        .select('plan')
        .eq('id', user.id)
        .single();

      if (userData?.plan) setPlan(userData.plan);

      const { data: usageData } = await supabase
        .from('usage_limits')
        .select('feature, used_count, reset_at')
        .eq('user_id', user.id);

      const usageMap = {};
      usageData?.forEach(item => {
        usageMap[item.feature] = {
          used: item.used_count,
          reset: item.reset_at
        };
      });
      setUsage(usageMap);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) console.error('Initial session error:', error);

      if (mounted) {
        const sessionUser = session?.user || null;
        setUser(sessionUser);
        if (sessionUser) {
          await fetchUserData(sessionUser);
        } else {
          setLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            await fetchUserData(session.user);
          } else {
            setUser(null);
            setPlan('free');
            setUsage({});
            setLoading(false);
          }
        }
      }
    );

    getInitialSession();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signup = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { plan: 'free' } }
      });
      if (error) throw error;
      if (data.user) {
        await fetchUserData(data.user);
        return data;
      }
      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const user = data?.user || data?.session?.user;
      if (!user) throw new Error('Login failed: No user returned');

      await fetchUserData(user);
      return { data: { user } };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setPlan('free');
      setUsage({});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getToken = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session?.access_token;
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  };

  const value = {
    user,
    plan,
    usage,
    loading,
    signup,
    login,
    logout,
    getToken,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};