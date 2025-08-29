import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import FontAwesome from '@expo/vector-icons/FontAwesome';
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
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={{ padding: 8, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.1)' }}
          >
            <FontAwesome name="home" size={24} color="#fbbf24" />
          </TouchableOpacity>
        </View>

        {/* 본문 → 텍스트 형식으로 출력 */}
        <ScrollView contentContainerStyle={styles.content}>
          {ingredients.length > 0 ? (
            ingredients.map((item, index) => (
              <View key={`${item?.id ?? index}`} style={styles.textBox}>
                <Text style={styles.name}>{item.title || item.name}</Text>
                <Text style={styles.desc}>{item.description}</Text>
              </View>
            ))
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
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  name: { fontSize: hp(2.2), fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  desc: { fontSize: hp(1.8), color: '#555', lineHeight: 22, textAlign: 'center' },
});
