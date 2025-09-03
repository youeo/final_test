import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://43.200.200.161:8080';

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const validateName = (text) => /^[가-힣]+$/.test(text);
  const validateBirth = (text) => /^\d{8}$/.test(text);

  const handleSignup = async () => {
    if (!name || !birth || !password || !id) {
      Alert.alert('입력 오류', '모든 항목을 입력해주세요.');
      return;
    }

    if (!validateName(name)) {
      Alert.alert('이름 오류', '이름은 한글만 입력 가능합니다.');
      return;
    }

    if (!validateBirth(birth)) {
      Alert.alert('생년월일 오류', '생년월일은 숫자 8자리로 입력해주세요. (예: 19950101)');
      return;
    }

    try {
      const bodyData = { userId: id, password };

      const response = await fetch('http://43.200.200.161:8080/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        Alert.alert('회원가입 완료', '성공적으로 가입되었습니다!');
        navigation.goBack();
      } else {
        const errorText = await response.text();
        Alert.alert('회원가입 실패', errorText || '서버 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      Alert.alert('오류', '서버와 연결할 수 없습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <AntDesign name="arrowleft" size={28} color="#558B2F" />
      </TouchableOpacity>

      <Text style={styles.title}>회원가입</Text>

      <TextInput
        style={styles.input}
        placeholder="이름 (한글만)"
        onChangeText={setName}
        value={name}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="생년월일 (YYYYMMDD)"
        keyboardType="numeric"
        onChangeText={setBirth}
        value={birth}
        maxLength={8}
        placeholderTextColor="#888"
      />
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
        secureTextEntry
        onChangeText={setPassword}
        value={password}
        placeholderTextColor="#888"
      />

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>회원가입</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f59e0b' },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#558B2F', marginBottom: 20, alignSelf: 'center', marginTop: 20 },
  input: { borderWidth: 1, borderColor: '#CCC', borderRadius: 10, padding: 10, marginBottom: 15, backgroundColor: '#fff', color: '#000' },
  button: { backgroundColor: '#558B2F', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  buttonText: { color: '#fff', fontSize: 16 },
  kakaoButton: { backgroundColor: '#FEE500', padding: 15, borderRadius: 10, alignItems: 'center' },
  kakaoText: { color: '#3C1E1E', fontWeight: 'bold' },
});

export default SignupScreen;