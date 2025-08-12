import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Alert, StatusBar } from 'react-native';
import React, { useState, useEffect } from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronLeftIcon, PlusIcon } from 'react-native-heroicons/outline';
import axios from 'axios';
import { getAuthToken } from '../../AuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://43.200.200.161:8080';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const renderSection = (title, data, navigateTo) => (
    <TouchableOpacity onPress={() => navigation.navigate(navigateTo, { userData: userData })} activeOpacity={0.8}>
      <Animated.View
        entering={FadeInDown.duration(700).springify().damping(12)}
        style={styles.sectionContainer} // ## 통일된 배경색 적용 ##
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {data && data.length > 0 ? (
              data.map((item, index) => (
                <View key={index} style={styles.itemBadge}>
                  <Text style={styles.itemText} numberOfLines={2}>{item}</Text>
                </View>
              ))
            ) : (
              <View style={styles.plusBadge}>
                <PlusIcon size={hp(4)} strokeWidth={2.5} color="#a1a1aa" />
              </View>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </TouchableOpacity>
  );

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#fbbf24" /></View>;
  }

  if (!userData) {
    return <View style={styles.centered}><Text>사용자 정보를 불러올 수 없습니다.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Animated.View entering={FadeInDown.delay(200).duration(1000)} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeftIcon size={hp(3.5)} strokeWidth={3} color="#333" />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.userInfoContainer}>
        <Text style={styles.userIdText}>{userData.userId}</Text>
      </View>

      <ScrollView style={styles.contentContainer} contentContainerStyle={{ paddingBottom: 20 }}>
        {renderSection('알레르기', userData.bannedList, 'SelectAllergyScreen')}
        {renderSection('조리도구', userData.toolsList, 'SelectToolScreen')}
        {renderSection('냉장고 현황', userData.ingredients.map(ing => ing.name), 'SelectIngredientsScreen')}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { width: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingTop: hp(7), paddingHorizontal: wp(5) },
  backButton: { padding: 5 },
  userInfoContainer: { paddingHorizontal: wp(5), marginTop: hp(1) },
  userIdText: { fontWeight: 'bold', fontSize: hp(4), color: '#1f2937' },
  contentContainer: { paddingHorizontal: wp(5), marginTop: hp(4) },
  sectionContainer: {
    backgroundColor: '#e5e7eb', 
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: wp(4),
    borderRadius: 16,
    marginBottom: hp(2.5),
  },
  sectionTitle: { fontSize: hp(2.2), fontWeight: 'bold', color: '#374151', marginBottom: hp(1.5) },
  itemBadge: { minWidth: wp(16), height: wp(16), backgroundColor: '#6c7a8cff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', padding: 8, marginRight: 12 },
  itemText: { color: 'white', fontSize: hp(1.8), textAlign: 'center' },
  plusBadge: { width: wp(16), height: wp(16), backgroundColor: '#e5e7eb', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  footer: { paddingHorizontal: wp(5), paddingBottom: hp(4), paddingTop: hp(2) },
  logoutButton: { backgroundColor: '#e5e7eb', paddingVertical: hp(1.8), borderRadius: 12, alignItems: 'center' },
  logoutButtonText: { color: '#4b5563', fontSize: hp(2), fontWeight: '600' }
});