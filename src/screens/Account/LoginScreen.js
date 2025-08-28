import React, { useEffect, useState } from 'react';
import {
  View, TextInput, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';

const API_BASE_URL = 'http://43.200.200.161:8080';

const LoginScreen = ({ navigation }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [isChecking, setIsChecking] = useState(true); // 앱 시작 시 토큰 검증 여부

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');

        // 토큰이 없으면 로그인 화면 노출
        if (!token) {
          setIsChecking(false);
          return;
        }

        // 토큰 검증 (유효하면 홈으로)
        const res = await fetch(`${API_BASE_URL}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          navigation.replace('Home');
        } else {
          // 만료/무효 토큰은 제거하고 로그인 화면 표시
          await AsyncStorage.removeItem('accessToken');
          setIsChecking(false);
        }
      } catch (error) {
        console.error('토큰 확인 오류:', error);
        setIsChecking(false);
      }
    };

    checkLoginStatus();
  }, [navigation]);

  const handleLogin = async () => {
    if (!id || !password) {
      Alert.alert('입력 오류', '아이디와 비밀번호를 모두 입력하세요.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.accessToken;
        await AsyncStorage.setItem('accessToken', token);
        Alert.alert('로그인 성공', '홈 화면으로 이동합니다.');
        navigation.replace('Home');
      } else {
        const errorText = await response.text();
        Alert.alert('로그인 실패', errorText || '서버 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      Alert.alert('오류', '서버와 연결할 수 없습니다.');
    }
  };

  // 검증 중에는 로딩만 노출(자동 진입 방지)
  if (isChecking) {
    return (
      <View style={[styles.container, { alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#fff', marginTop: 12 }}>로그인 상태 확인 중…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인</Text>

      <TextInput
        style={styles.input}
        placeholder="아이디"
        onChangeText={setId}
        value={id}
        placeholderTextColor="#888"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
        placeholderTextColor="#888"
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>로그인</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignupScreen')}>
        <Text style={styles.signupText}>회원가입</Text>
      </TouchableOpacity>

      <View style={styles.iconRow}>
        <TouchableOpacity style={[styles.iconCircle, { backgroundColor: '#FEE500' }]}>
          <Ionicons name="chatbubble-ellipses" size={24} color="#3C1E1E" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconCircle, { backgroundColor: '#fff' }]}>
          <AntDesign name="google" size={24} color="#DB4437" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconCircle, { backgroundColor: '#1877F2' }]}>
          <AntDesign name="facebook-square" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconCircle, { backgroundColor: '#ccc' }]}>
          <MaterialIcons name="email" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f59e0b',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#558B2F',
    marginBottom: 30,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
    color: '#000',
  },
  button: {
    backgroundColor: '#558B2F',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  signupText: {
    color: '#eee',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginBottom: 20,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 10,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 1, height: 2 },
  },
});

export default LoginScreen;