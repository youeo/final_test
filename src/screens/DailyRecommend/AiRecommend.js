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

const Item = ({ recipe, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    className="mx-5"
    style={{ marginTop: 15 }}
  >
    <View
      style={{ flex: 1, flexDirection: 'row', backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' }}
      className="space-x-2 rounded-2xl px-3 py-3"
    >
      <View style={{ flex: 1 }} className="space-y-2">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* name 굵게 */}
          <Text className="font-semibold text-lg flex-1" numberOfLines={1}>
            {recipe.name || recipe.title}
          </Text>
          {/* 조리시간 우측 상단 */}
          {recipe.time && (
            <View style={{ backgroundColor: '#fbbf24', borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 4, marginLeft: 'auto' }}>
              <Text className="text-xs text-white font-semibold">{recipe.time}</Text>
            </View>
          )}
        </View>
        {/* instruction 1번만 노출 */}
        {recipe.recipe?.[0] ? (
          <Text className="text-sm text-gray-600" numberOfLines={2}>
            {recipe.recipe[0]}
          </Text>
        ) : null}
      </View>
    </View>
  </TouchableOpacity>
);

export default function AiRecommend() {
  const navigation = useNavigation();
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortKey, setSortKey] = useState('alpha'); // 'alpha' | 'time'

  // 오늘의 추천 레시피 불러오기
  const fetchRecipes = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        navigation.navigate('LoginScreen');
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/api/recipes/recipetoday`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(res.data)) {
        setRecipes(res.data);
      } else if (res.data) {
        setRecipes([res.data]);
      } else {
        setRecipes([]);
      }
    } catch (error) {
      console.log('[AiRecommend] Axios error', error?.response || error.message);
      Alert.alert('오류', '오늘의 추천 레시피를 불러오는 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 오늘의 레시피 서버에 세팅하기
  const setTodayMeal = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        navigation.navigate('LoginScreen');
        return;
      }

      await axios.post(`${API_BASE_URL}/api/recipes/setTodayMeal`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert('완료', '오늘의 추천 레시피가 새로 설정되었습니다.');
      fetchRecipes(); // 다시 불러오기
    } catch (error) {
      console.log('[AiRecommend] setTodayMeal error', error?.response || error.message);
      Alert.alert('오류', '오늘의 추천 레시피 설정 중 문제가 발생했습니다.');
    }
  };

  const sortRecipes = (list) => {
    if (!Array.isArray(list)) return [];
    if (sortKey === 'time') {
      return [...list].sort((a, b) => {
        const parseMinutes = (timeStr) => {
          if (!timeStr) return Infinity;
          const match = String(timeStr).match(/\d+/);
          return match ? parseInt(match[0], 10) : Infinity;
        };
        return parseMinutes(a?.time) - parseMinutes(b?.time);
      });
    }
    return [...list].sort((a, b) => (a?.name || a?.title || '').localeCompare(b?.name || b?.title || '', 'ko-KR'));
  };

  useEffect(() => {
    fetchRecipes();
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
    <Animated.View entering={FadeInDown.delay(100).duration(800).springify().damping(12)} style={{ flex: 1 }}>
      <StatusBar hidden={true} />
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 rounded-full bg-black/10">
            <ChevronLeftIcon size={hp(3.5)} strokeWidth={4.5} color="#fbbf24" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>오늘의 추천 레시피</Text>
          {/* 새로고침 버튼 */}
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={setTodayMeal} className="p-2 rounded-full bg-black/10 mr-2">
              <Ionicons name="refresh" size={28} color="#fbbf24" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 정렬 버튼 */}
        <View style={{ alignItems: 'flex-start', paddingHorizontal: wp(4), paddingVertical: 6 }}>
          <TouchableOpacity style={{ flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6' }} onPress={() => setSortOpen(true)}>
            <Text style={{ marginRight: 4, color: '#6b7280' }}>{sortKey === 'alpha' ? '가나다순' : '조리시간순'}</Text>
            <Ionicons style={{ marginTop: 2 }} name="swap-vertical" size={16} color="#666" />
          </TouchableOpacity>
        </View>

        {/* 정렬 모달 */}
        <Modal animationType="fade" transparent={true} visible={sortOpen} onRequestClose={() => setSortOpen(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSortOpen(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>정렬 기준 선택</Text>
              <TouchableOpacity style={[styles.sortOption, sortKey === 'alpha' && styles.selectedSortOption]} onPress={() => { setSortKey('alpha'); setSortOpen(false); }}>
                <Text style={[styles.sortOptionText, sortKey === 'alpha' && styles.selectedSortOptionText]}>가나다순</Text>
                {sortKey === 'alpha' && <Ionicons name="checkmark" size={20} color="#007AFF" />}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.sortOption, sortKey === 'time' && styles.selectedSortOption]} onPress={() => { setSortKey('time'); setSortOpen(false); }}>
                <Text style={[styles.sortOptionText, sortKey === 'time' && styles.selectedSortOptionText]}>조리시간순</Text>
                {sortKey === 'time' && <Ionicons name="checkmark" size={20} color="#007AFF" />}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        <ScrollView>
          {/* 레시피 개수 표시 */}
          <Text style={{ marginLeft: wp(4), marginTop: 10, color: '#6b7280' }}>
            레시피 개수: {recipes.length}
          </Text>

          {recipes.length > 0 ? (
            sortRecipes(recipes).map((item, index) => (
              <Item
                key={`${item?.id ?? index}`}
                recipe={item}
                onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
              />
            ))
          ) : (
            <View style={{ alignItems: 'center', marginTop: hp(20) }}>
              <Text style={{ fontSize: hp(2), color: '#6b7280' }}>추천할 수 있는 레시피가 없습니다.</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: hp(7), paddingBottom: hp(2), paddingHorizontal: wp(4), backgroundColor: '#f9fafb', borderBottomWidth: 1, borderColor: '#e5e7eb', marginBottom: 10 },
  headerTitle: { fontSize: hp(2.5), fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  sortOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 12, borderRadius: 8, marginBottom: 8 },
  selectedSortOption: { backgroundColor: '#f0f8ff' },
  sortOptionText: { fontSize: 16, color: '#333' },
  selectedSortOptionText: { color: '#007AFF', fontWeight: '500' },
});
