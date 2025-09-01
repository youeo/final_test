import { View, Text, ScrollView, Image, StatusBar, TouchableOpacity, Pressable, StyleSheet, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { UserCircleIcon } from 'react-native-heroicons/solid';
import axios from 'axios';
import { getAuthToken } from '../AuthService';

const API_BASE_URL = 'http://43.200.200.161:8080';

export default function HomeScreen() {

  const navigation = useNavigation();
  const [fridgeItems, setFridgeItems] = useState([]);

  // 공통 섀도우 스타일
  const shadow = styles.shadow;

  useEffect(() => {
    (async () => {
      try {
        const token = await getAuthToken();
        if (!token) return;

        const res = await axios.get(`${API_BASE_URL}/api/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const user = res.data || {};
        
        const raw =
          user.ingredients ??
          [];

        const items = Array.isArray(raw)
          ? raw.map(x => (typeof x === 'string' ? x : (x?.name ?? ''))).filter(Boolean)
          : [];

        setFridgeItems(items);
      } catch (e) {
        console.warn('[fridge load fail]', e?.response?.status, e?.response?.data);
        setFridgeItems([]);
      }
    })();
  }, []);


  // 공통 초록 카드
  const ActionCard = ({ title, onPress, icon }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={[styles.card, shadow]}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.qCircle}>
        {icon}
      </View>
    </TouchableOpacity>
  );

  // 칩
  const Chip = ({ label }) => (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar backgroundColor="#e8e9eb" barStyle="dark-content" />

      {/* 상단바 */}
      <View
        style={{ height: 60, borderBottomWidth: 4, borderBottomColor: '#f2ca38' }}
        className="flex-row justify-between items-center mb-2 top-12 bottom-2 pb-2 pt-2 bg-black/10"
      >
        <Image
          source={require('../../assets/images/recipppe.png')}
          style={{ marginLeft: 25, height: hp(3.2), width: hp(8.3) }}
        />
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <UserCircleIcon size={hp(5.5)} color="#ffab00"
            style={{
              marginRight: 16,
            }}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>

        {/* 냉장고 현황 카드 */}
        <View style={styles.topSection}>
        <View style={[styles.fridgeWrap, shadow]}>
          <View style={styles.fridgeInner}>
            <Text style={styles.fridgeTitle}>나의 냉장고 현황</Text>

            <View style={styles.chipsBox}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                {fridgeItems.length === 0 ? (
                  <Text style={{ color: '#9ca3af' }}>등록된 재료가 없어요</Text>
                ) : (
                  fridgeItems.map((it, idx) => <Chip key={`${it}-${idx}`} label={it} />)
                )}
              </ScrollView>
            </View>
            <View style={styles.handle} />
            </View>
          </View>
        </View>

        {/* 선택 박스들 */}
        <View style={styles.bottomSection}>
          <View style={styles.grid}>
            <ActionCard 
              title="레시피 검색" 
              onPress={() => navigation.navigate('Select_cate')} 
              icon={<AntDesign name="search1" size={28} color="#ffab00" />} 
            />
            <ActionCard 
              title="나의 레시피" 
              onPress={() => navigation.navigate('MyRecipe')} 
              icon={<AntDesign name="book" size={28} color="#ffab00" />} 
            />
            <ActionCard 
              title="오늘의 추천 레시피" 
              onPress={() => navigation.navigate('AiRecommend')} 
              icon={<AntDesign name="staro" size={28} color="#ffab00" />} 
            />
            <ActionCard 
              title="오늘의 식재료 상식" 
              onPress={() => navigation.navigate('TodaysIngredient')} 
              icon={<AntDesign name="bulb1" size={28} color="#ffab00" />} 
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    marginLeft: 4,
    marginRight: 4,
    marginTop: 50,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  topSection: {
    flex: 0.8,
  },
  bottomSection: {
    flex: 1,
    paddingTop: 12,
  },
  shadow: {
    // iOS
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    // Android
    elevation: 8,
  },

  // 냉장고 카드
  fridgeWrap: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 4,
    marginBottom: 5,
    borderColor: '#f2ca38',
    backgroundColor: '#fff',
  },
  fridgeInner: {
    flex: 1,
    borderRadius: 14,
    margin: 8,
    paddingVertical: 16,
    paddingHorizontal: 14,
    backgroundColor: '#e9ebef',
  },
  fridgeTitle: {
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 20,
    color: '#2e7d32',
    marginBottom: 20,
  },
  chipsBox: {
    flex: 1,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 6,
    justifyContent: 'flex-start',
  },
  chip: {
    backgroundColor: '#43794b',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  chipText: {
    color: '#fff',
    fontWeight: '600',
  },
  handle: {
    alignSelf: 'center',
    width: '40%',
    height: 20,
    marginTop: 'auto',
    marginBottom: 10,
    borderRadius: 20,
    backgroundColor: '#9aa1a9',
    opacity: 0.6,
  },

  // 그리드
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  // 기능 카드
  card: {
    width: '48%',
    height: '50%',  
    marginTop: '2%',
    marginBottom: '4%',
    backgroundColor: '#43794b',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: '#ffecb3',
    fontSize: hp(2.1),
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  qCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#43794b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffab00',
  },
  qMark: {
    color: '#ffab00',
    fontSize: 22,
    fontWeight: '800',
  },
});