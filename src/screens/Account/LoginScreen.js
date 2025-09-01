import React, { useEffect, useRef, useState } from 'react';
import {
  View, TextInput, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import qs from 'qs';

const API_BASE_URL = 'http://43.200.200.161:8080';

// Kakao OAuth 설정
const REACT_APP_CLIENT_ID = '906c108fa252d61e18b923f34f00cb5b';
// ⚠️ Kakao Developers 콘솔에 "정확히" 이 주소를 Redirect URI로 등록해야 합니다.
const REACT_APP_REDIRECT_URI = 'http://43.200.200.161:8080/api/kakao';

// 카카오 토큰 엔드포인트 (교환 포맷 고정)
const KAKAO_TOKEN_URL = 'https://kauth.kakao.com/oauth/token';
// (선택) 콘솔에서 Client Secret 사용 중이면 채워넣으세요. 아니면 빈 문자열 유지.
const KAKAO_CLIENT_SECRET = '';

// 로그인 화면에서 열 WebView용 카카오 인증 URL
const KAKAO_AUTH_URL =
  `https://kauth.kakao.com/oauth/authorize?` +
  `client_id=${encodeURIComponent(REACT_APP_CLIENT_ID)}` +
  `&redirect_uri=${encodeURIComponent(REACT_APP_REDIRECT_URI)}` +
  `&response_type=code` +
  `&prompt=select_account`; // 새 로그인 유도

const LoginScreen = ({ navigation }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [isChecking, setIsChecking] = useState(true);

  // 카카오 로그인 WebView 상태
  const [showKakaoWebView, setShowKakaoWebView] = useState(false);
  const webviewRef = useRef(null);

  // 리다이렉트 중복 처리 방지 가드
  const handledRef = useRef(false);

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

  // 카카오 로그인 버튼 클릭 → WebView 오픈
  const handleKakaoLogin = () => {
    handledRef.current = false; // 새 시도 때마다 초기화
    setShowKakaoWebView(true);
  };

  // (핵심) 인가코드 → 카카오 토큰 교환 (x-www-form-urlencoded 포맷 고정)
  const exchangeCodeForKakaoToken = async (code) => {
    const form = qs.stringify({
      grant_type: 'authorization_code',
      client_id: REACT_APP_CLIENT_ID,       // 반드시 REST API 키
      redirect_uri: REACT_APP_REDIRECT_URI, // 인가 요청 때와 "완전히 동일"
      code,                                 // 방금 받은 새 코드
      ...(KAKAO_CLIENT_SECRET ? { client_secret: KAKAO_CLIENT_SECRET } : {}),
    });

    const resp = await axios.post(KAKAO_TOKEN_URL, form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 7000,
    });
    return resp.data; // { access_token, refresh_token, token_type, expires_in, ... }
  };

  // (핵심) 카카오 토큰 교환 후 → 우리 서버 로그인
  const loginWithKakaoAccessToken = async (kakaoAccessToken) => {
    // 1) 앞뒤 공백/개행 제거로 "토큰 잘림/이상문자" 예방
    const token = (kakaoAccessToken ?? '').trim();
    if (!token) throw new Error('kakaoAccessToken is empty');

    // 2) 길이/앞·뒤 일부만 찍어 실제로 바뀌는지 검증(개인정보 노출 방지)
    console.log('[Kakao] token len / head / tail:', token.length, token.slice(0, 12), token.slice(-6));

    // 3) 서버로 전달: Authorization 헤더 사용 안 함(보안필터 오인 방지)
    //    커스텀 헤더 + JSON 바디로 동시에 전달
    const resp = await fetch(`${API_BASE_URL}/api/kakao`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        //'Accept': 'application/json' 이거 절대 쓰지 말기
      },
      body: JSON.stringify({ accessToken: token }), // ← DTO 필드명과 동일
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`백엔드 인증 실패: HTTP ${resp.status} ${txt}`);
    }

    const appData = await resp.json();
    if (!appData?.accessToken) throw new Error('백엔드 응답에 accessToken이 없습니다.');
    return appData.accessToken;
  };

  const handleKakaoCallback = async (code) => {
    try {
      // 1) 카카오 토큰 교환 (포맷 고정)
      const tk = await exchangeCodeForKakaoToken(code);
      if (!tk?.access_token) {
        throw new Error(`카카오 토큰 교환 실패: ${JSON.stringify(tk)}`);
      }

      // ✅ 토큰 유효성 즉시 확인
      try {
        const me = await axios.get('https://kapi.kakao.com/v2/user/me', {
          headers: { Authorization: `Bearer ${tk.access_token}` },
          timeout: 7000,
        });
        console.log('[Kakao] /v2/user/me OK id:', me.data?.id);
      } catch (e) {
        console.log('[Kakao] /v2/user/me FAIL:', e?.response?.status, e?.response?.data);
        throw new Error('교환된 access_token이 카카오에서 401입니다. (redirect_uri/재사용/키 설정 확인)');
      }

      // 2) 우리 서버 로그인(카카오 access_token 전달)
      const appAccessToken = await loginWithKakaoAccessToken(tk.access_token);

      // 3) 앱 토큰 저장 및 이동
      await AsyncStorage.setItem('accessToken', appAccessToken);
      Alert.alert('로그인 성공', '홈 화면으로 이동합니다.');
      navigation.replace('Home');
    } catch (err) {
      console.error('카카오 로그인 교환 실패:', err);
      Alert.alert('카카오 로그인 실패', String(err?.message || err));
    } finally {
      setShowKakaoWebView(false);
    }
  };

  // WebView에서 리다이렉트 감지하여 code 추출 (동기 boolean 반환! + 중복 가드)
  const onShouldStartLoadWithRequest = (request) => {
    const { url } = request;

    if (url.startsWith(REACT_APP_REDIRECT_URI)) {
      if (handledRef.current) return false; // 이미 처리했으면 차단
      handledRef.current = true;

      const codeMatch = url.match(/[?&]code=([^&]+)/);
      const code = codeMatch ? decodeURIComponent(codeMatch[1]) : null;

      setShowKakaoWebView(false);
      if (code) {
        // 비동기 호출 (await 금지)
        handleKakaoCallback(code);
      } else {
        Alert.alert('카카오 로그인 실패', '인가코드를 확인할 수 없습니다.');
      }
      return false; // 반드시 boolean
    }

    return true; // 반드시 boolean
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

      <TouchableOpacity style={styles.kakaoButton} onPress={handleKakaoLogin}>
        <Text style={styles.kakaoText}>카카오 계정으로 로그인</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignupScreen')}>
        <Text style={styles.signupText}>회원가입</Text>
      </TouchableOpacity>

      {/* Kakao Login WebView */}
      <Modal visible={showKakaoWebView} animationType="slide" onRequestClose={() => setShowKakaoWebView(false)}>
        <View style={{ flex: 1 }}>
          <WebView
            ref={webviewRef}
            source={{ uri: KAKAO_AUTH_URL }}
            incognito
            onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
            startInLoadingState
            javaScriptEnabled
            domStorageEnabled
          />
        </View>
      </Modal>
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