import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import { getAuthToken } from '../../AuthService';

const API_BASE_URL = 'http://43.200.200.161:8080';

export default function IngredientToday() {
  const navigation = useNavigation();
  const [ingredients, setIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 서버에서 오늘의 식재료 불러오기
  const fetchIngredients = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        navigation.navigate('LoginScreen');
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/api/recipes/Ingredienttoday`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(res.data)) {
        setIngredients(res.data);
      } else if (res.data) {
        setIngredients([res.data]); // 객체라면 배열로 감싸기
      } else {
        setIngredients([]);
      }
    } catch (error) {
      console.log('[IngredientToday] Axios error', error?.response || error.message);
      Alert.alert('오류', '오늘의 식재료를 불러오는 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 오늘의 식재료 서버에 세팅하기
  const setTodayIng = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        navigation.navigate('LoginScreen');
        return;
      }

      await axios.post(`${API_BASE_URL}/api/recipes/setTodayIng`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 성공 시 Alert 제거 → 바로 새 데이터 불러오기
      fetchIngredients();
    } catch (error) {
      console.log('[IngredientToday] setTodayIng error', error?.response || error.message);
      Alert.alert('오류', '오늘의 식재료 설정 중 문제가 발생했습니다.');
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <StatusBar hidden={true} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#fbbf24" />
          <Text style={{ marginTop: 6, color: '#6b7280' }}>불러오는 중…</Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      entering={FadeInDown.delay(100).duration(800).springify().damping(12)}
      style={{ flex: 1 }}
    >
      <StatusBar hidden={true} />
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ padding: 8, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.1)' }}
          >
            <ChevronLeftIcon size={hp(3.5)} strokeWidth={4.5} color="#fbbf24" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>오늘의 식재료 상식</Text>
          <View style={{ flexDirection: 'row' }}>
            {/* 새로고침 버튼 */}
            <TouchableOpacity
              onPress={setTodayIng}
              style={{ padding: 8, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.1)', marginRight: 8 }}
            >
              <Ionicons name="refresh" size={28} color="#fbbf24"/>
            </TouchableOpacity>
          </View>
        </View>

        {/* 본문 (text) */}
        <ScrollView contentContainerStyle={styles.content}>
          {ingredients.length > 0 ? (
            ingredients.map((item, index) => {
              const sentences = (item.description || '')
                .split('.')
                .map(s => s.trim())
                .filter(Boolean)
                // .map(s => `　${s}.`) // 들여쓰기 구현

              return (
                <View key={`${item?.id ?? index}`} style={styles.textBox}>
                  <Text className="text-neutral-700" style={styles.name}>{item.title || item.name}</Text>
                  <View style={styles.underline} />
                  <Text style={styles.desc}>
                    {sentences.join('\n')}
                  </Text>
                </View>
              );
            })
          ) : (
            <View style={{ alignItems: 'center', marginTop: hp(20) }}>
              <Text style={{ fontSize: hp(2), color: '#6b7280' }}>오늘의 식재료가 없습니다.</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: hp(7),
    paddingBottom: hp(2),
    paddingHorizontal: wp(4),
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  headerTitle: { fontSize: hp(2.5), fontWeight: 'bold' },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    padding: wp(5),
  },
  textBox: {
    width: '100%',
    marginBottom: 20,
    padding: 1,
    borderRadius: 12,
    alignItems: 'flex-left',
  },
  name: { 
    fontSize: hp(3),
    fontWeight: 'bold', 
    marginBottom: 8, 
    textAlign: 'left',
    marginLeft: 5,
  },
  underline: {
    width: 365,
    height: 3.5,
    backgroundColor: '#fbbf24', // Tailwind의 yellow-400
    marginBottom: 15,
    marginTop: 2,
    marginLeft: 3,
  },
  desc: { 
    fontSize: hp(1.9), 
    color: '#555', 
    fontWeight: '500', 
    lineHeight: 28,
    textAlign: 'left',
    width: '98%',
    marginLeft: 5,
  },
});
