import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE = 'https://every-day-trader-web-production.up.railway.app/api';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const saved = await AsyncStorage.getItem('alpaca_auth');
      if (saved) {
        const { apiKey: key } = JSON.parse(saved);
        setApiKey(key);
        setIsLoggedIn(true);
        fetchPortfolio(key);
      }
    } catch (e) {
      console.error('Auth check failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolio = async (key) => {
    try {
      const response = await axios.get(`${API_BASE}/portfolio`, {
        headers: { Authorization: `Bearer ${key}` }
      });
      setPortfolio(response.data);
      setError(null);
    } catch (e) {
      setError('Failed to fetch portfolio. Check your credentials.');
      console.error('Portfolio fetch failed:', e);
    }
  };

  const handleLogin = async () => {
    if (!apiKey || !apiSecret) {
      setError('Both fields required');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        apiKey,
        apiSecret
      });

      if (response.data.token) {
        await AsyncStorage.setItem('alpaca_auth', JSON.stringify({
          apiKey,
          apiSecret,
          token: response.data.token
        }));
        setIsLoggedIn(true);
        fetchPortfolio(response.data.token);
        setError(null);
      }
    } catch (e) {
      setError('Login failed. Check your Alpaca credentials.');
      console.error('Login error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('alpaca_auth');
    setIsLoggedIn(false);
    setApiKey('');
    setApiSecret('');
    setPortfolio(null);
    setError(null);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00D9FF" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>WISE² Trading</Text>
        <View style={styles.form}>
          <Text style={styles.label}>Alpaca API Key</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter API Key"
            placeholderTextColor="#666"
            value={apiKey}
            onChangeText={setApiKey}
            secureTextEntry={false}
          />

          <Text style={styles.label}>Alpaca Secret</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Secret"
            placeholderTextColor="#666"
            value={apiSecret}
            onChangeText={setApiSecret}
            secureTextEntry
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WISE² Trading</Text>
      <Text style={styles.subtitle}>Dashboard</Text>
      {portfolio ? (
        <>
          <Text style={styles.text}>Portfolio: ${portfolio.value?.toLocaleString()}</Text>
          <Text style={styles.text}>P&L: ${portfolio.pnl?.toLocaleString()} ({portfolio.pnlPct?.toFixed(2)}%)</Text>
        </>
      ) : (
        <ActivityIndicator size="large" color="#00D9FF" style={{ marginVertical: 20 }} />
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050607',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00D9FF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#00FF7F',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#fff',
    marginVertical: 8,
  },
});
