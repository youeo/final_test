import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!id || !password) {
      Alert.alert('입력 오류', '아이디와 비밀번호를 모두 입력하세요.');
      return;
    }

    try {
      const response = await fetch('http://43.200.200.161:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: id,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.accessToken;

        // ✅ 토큰을 AsyncStorage에 저장
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인</Text>

      <TextInput
        style={styles.input}
        placeholder="아이디"
        onChangeText={setId}
        value={id}
        placeholderTextColor="#888"
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
