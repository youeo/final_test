import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Alert, StatusBar, Modal, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronLeftIcon, PlusIcon, ChevronRightIcon } from 'react-native-heroicons/outline';
import { UserCircleIcon } from 'react-native-heroicons/solid';
import axios from 'axios';
import { getAuthToken } from '../../AuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://43.200.200.161:8080';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isModalVisible, setModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isFocused) {
      fetchUserData();
    }
  }, [isFocused]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = response.data;
      
      const BITS_TO_NAMES = (bits, map) => Object.keys(map).filter(name => (bits & map[name]) !== 0);
      
      const TOOLS_MAP = { '프라이팬': 1, '냄비': 2, '웍': 4, '밀대': 8, '믹서기': 16, '핸드블랜더': 32, '거품기': 64, '연육기': 128, '착즙기': 256, '전자레인지': 512, '가스레인지': 1024, '오븐': 2048, '에어프라이어': 4096, '주전자': 8192, '압력솥': 16384, '토스터': 32768, '찜기': 65536 };
      const ALLERGY_MAP = { '돼지고기': 1, '쇠고기': 2, '닭고기': 4, '고등어': 8, '게': 16, '새우': 32, '오징어': 64, '조개류': 128, '대두': 256, '땅콩': 512, '메밀': 1024, '밀': 2048, '잣': 4096, '호두': 8192, '복숭아': 16384, '토마토': 32768, '난류': 65536, '우유': 131072, '아황산': 262144 };

      setUserData({
          ...user,
          toolsList: BITS_TO_NAMES(user.tools, TOOLS_MAP),
          bannedList: BITS_TO_NAMES(user.banned, ALLERGY_MAP),
      });
      
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      await AsyncStorage.removeItem('accessToken');
      navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
    } finally {
        setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "로그아웃",
      "정말 로그아웃 하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { 
          text: "확인", 
          onPress: async () => {
            await AsyncStorage.removeItem('accessToken');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleDeleteAccount = async () => {
    if (!password) {
        Alert.alert("오류", "비밀번호를 입력해주세요.");
        return;
    }
    setIsDeleting(true);
    try {
        const token = await getAuthToken();
        const response = await axios.delete(`${API_BASE_URL}/api/delete`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { password: password }
        });

        if (response.data === 1) {
            Alert.alert("완료", "회원 탈퇴가 처리되었습니다.");
            setModalVisible(false);
            await AsyncStorage.removeItem('accessToken');
            navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        } else if (response.data === 4) {
            Alert.alert("오류", "비밀번호가 일치하지 않습니다.");
        } else {
            throw new Error("알 수 없는 서버 응답");
        }
    } catch (error) {
        console.error("Delete account error:", error.response || error);
        Alert.alert("오류", "회원 탈퇴 중 문제가 발생했습니다.");
    } finally {
        setIsDeleting(false);
        setPassword('');
    }
  };

  const renderSection = (title, data, navigateTo) => (
    <Animated.View entering={FadeInDown.duration(700).springify().damping(12)}>
        <TouchableOpacity 
            onPress={() => navigation.navigate(navigateTo, { userData: userData })} 
            activeOpacity={0.8}
            style={styles.sectionContainer}
        >
            <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {data && data.length > 0 ? (
                        data.map((item, index) => (
                            <View key={index} style={styles.itemBadge}>
                                <Text style={styles.itemText}>{item}</Text>
                            </View>
                        ))
                    ) : (
                        <View style={styles.plusBadge}>
                            <PlusIcon size={hp(3)} strokeWidth={2.5} color="#a1a1aa" />
                        </View>
                    )}
                </ScrollView>
            </View>
            <ChevronRightIcon size={hp(3)} color="#d1d5db" />
        </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#fbbf24" /></View>;
  }

  if (!userData) {
    return <View style={styles.centered}><Text>사용자 정보를 불러올 수 없습니다.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <ChevronLeftIcon size={hp(3.5)} strokeWidth={3} color="#fbbf24" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필</Text>
        <View style={{ width: hp(5) }} /> 
      </View>

      <ScrollView style={styles.contentContainer} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.userInfoContainer}>
            <UserCircleIcon size={hp(8)} color="#d1d5db" />
            <Text style={styles.userIdText}>{userData.userId}</Text>
        </View>

        {renderSection('알레르기', userData.bannedList, 'SelectAllergyScreen')}
        {renderSection('조리도구', userData.toolsList, 'SelectToolScreen')}
        {renderSection('냉장고', userData.ingredients.map(ing => ing.name), 'SelectIngredientsScreen')}
      
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>회원 탈퇴</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>회원 탈퇴</Text>
                <Text style={styles.modalText}>
                    계정을 삭제하시려면 비밀번호를 입력해주세요. 이 작업은 되돌릴 수 없습니다.
                </Text>
                <TextInput
                    style={styles.modalInput}
                    placeholder="비밀번호"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                />
                <View style={styles.modalButtons}>
                    <TouchableOpacity
                        style={[styles.modalButton, styles.cancelButton]}
                        onPress={() => setModalVisible(false)}
                    >
                        <Text style={styles.cancelButtonText}>취소</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.modalButton, styles.confirmButton]}
                        onPress={handleDeleteAccount}
                        disabled={isDeleting}
                    >
                        {isDeleting ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmButtonText}>탈퇴</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: hp(7),
    paddingHorizontal: wp(5),
    paddingBottom: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerButton: {
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 999,
  },
  headerTitle: {
    fontSize: hp(2.2),
    fontWeight: 'bold',
  },
  userInfoContainer: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(4),
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIdText: {
    fontWeight: 'bold',
    fontSize: hp(3),
    color: '#1f2937',
    marginLeft: wp(4),
  },
  contentContainer: {
    paddingHorizontal: wp(5),
  },
  sectionContainer: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: wp(4),
    borderRadius: 16,
    marginBottom: hp(2.5),
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: hp(2.2),
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: hp(1.5),
  },
  itemBadge: {
    backgroundColor: '#4b5563',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  itemText: {
    color: 'white',
    fontSize: hp(1.8),
  },
  plusBadge: {
    width: wp(12),
    height: wp(12),
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  logoutButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: hp(1.8),
    borderRadius: 12,
    alignItems: 'center',
    marginTop: hp(4),
  },
  logoutButtonText: {
    color: '#4b5563',
    fontSize: hp(2),
    fontWeight: '600',
  },
  // --- ## 회원탈퇴 버튼 스타일 수정 ## ---
  deleteButton: {
    alignItems: 'center',
    marginTop: hp(3),
    paddingVertical: 8, // 터치 영역 확보
  },
  deleteButtonText: {
    color: '#ef4444', // 빨간색
    fontSize: hp(1.8),
    textDecorationLine: 'underline', // 밑줄
  },
  // ---
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: hp(2.5),
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: hp(1.8),
    color: '#4b5563',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#e5e7eb',
  },
  cancelButtonText: {
    color: '#4b5563',
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#ef4444',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});