import React, { useEffect, useState } from 'react';
import {
  View, TextInput, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as KakaoLogins from '@react-native-seoul/kakao-login';
import { AntDesign, Ionicons } from '@expo/vector-icons';

const API_BASE_URL = 'http://43.200.200.161:8080';

const LoginScreen = ({ navigation }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          setIsChecking(false);
          return;
        }
        const res = await fetch(`${API_BASE_URL}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          navigation.replace('Home');
        } else {
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

  // ✅ 카카오 로그인
  const handleKakaoLogin = async () => {
    try {
      const token = await KakaoLogins.login();
      console.log('카카오 토큰:', token);

      const profile = await KakaoLogins.getProfile();
      console.log('카카오 프로필:', profile);

      // 필요 시 서버 전송
      Alert.alert('카카오 로그인 완료', `${profile.nickname}님 환영합니다!`);
    } catch (err) {
      console.error('카카오 로그인 실패:', err);
      Alert.alert('카카오 로그인 실패', '카카오 계정 정보를 불러올 수 없습니다.');
    }
  };

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

      {/* 카카오 로그인 버튼 추가 */}
      <TouchableOpacity style={styles.kakaoButton} onPress={handleKakaoLogin}>
        <Text style={styles.kakaoText}>카카오 계정으로 로그인</Text>
      </TouchableOpacity>

      {/* 회원가입 텍스트는 카카오 버튼 아래 */}
      <TouchableOpacity onPress={() => navigation.navigate('SignupScreen')}>
        <Text style={styles.signupText}>회원가입</Text>
      </TouchableOpacity>
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
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  kakaoText: {
    color: '#3C1E1E',
    fontWeight: 'bold',
  },
  signupText: {
    color: '#eee',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 5,
  },
});

export default LoginScreen;
