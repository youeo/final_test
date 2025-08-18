import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';
import { AntDesign } from '@expo/vector-icons';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getAuthToken } from '../../AuthService';
import LoadingScreen from './LoadingScreen';

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
      <View style={{ flex: 0.3, justifyContent: 'center' }}>
        {/* 만약 이미지 넣기가 어려우면 없애고 글만 내보내도 될 것 같습니다 */}
        <Image
          source={require('../../../assets/images/placeholder.jpg')}
          style={{ width: 80, height: 80 }}
          className="rounded-full"
        />
      </View>
      <View style={{ flex: 0.7 }} className="space-y-2">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text className="font-semibold text-lg flex-1" numberOfLines={1}>{recipe.name}</Text>
          <View style={{ backgroundColor: '#fbbf24', borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text className="text-xs text-white font-semibold">{recipe.time}</Text>
          </View>
        </View>
        {recipe.recipe?.[0] ? (
          <Text className="text-sm text-gray-600" numberOfLines={2}>
            {recipe.recipe[0]}
          </Text>
        ) : null}
      </View>
    </View>
  </TouchableOpacity>
);

export default function RecommendScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { mainIngredients, subIngredients } = route.params || {};

  const [activeTab, setActiveTab] = useState('possible');

  // 두개 한 번에 불러오면 오래걸리는 것 같아서 일단은 나눠뒀습니다.
  const [isLoading, setIsLoading] = useState(true); // 초기 화면 로딩
  const [isLoadingNeeds, setIsLoadingNeeds] = useState(false); // 추가 재료 탭 로딩

  const [recipesPossible, setRecipesPossible] = useState([]);
  const [recipesNeeds, setRecipesNeeds] = useState([]);

  // 탭 분류
  const fetchRecipes = async (tab = 'possible') => {
    // 탭별 로딩 시작
    if (tab === 'possible') setIsLoading(true);
    else setIsLoadingNeeds(true);

    try {
      let token = await getAuthToken();
      if (!token) {
        Alert.alert("로그인 필요", "레시피를 추천받으려면 로그인이 필요합니다.");
        navigation.navigate('LoginScreen');
        return;
      }

      // 사용자 정보
      const userResponse = await axios.get(`${API_BASE_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const currentUser = userResponse.data || {};

      const safeMain = Array.isArray(mainIngredients) ? mainIngredients : [];
      const safeSub  = Array.isArray(subIngredients) ? subIngredients : [];

      const requestData = {
        mainIngredients: mainIngredients?.[0] || null,
        subIngredients: [...(mainIngredients?.slice(1) || []), ...(subIngredients || [])],
        Banned: currentUser.banned,
        Tool: currentUser.tools
      };

      const endpoint = tab === 'possible'
        ? `${API_BASE_URL}/api/recipes/searchFromAI`
        : `${API_BASE_URL}/api/recipes/searchFromAIAddAllow`;

      const res = await axios.post(endpoint, requestData, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });

      const cleaned = (Array.isArray(res.data) ? res.data : [])
        .filter(r => !!(r?.recipe?.[0] && String(r.recipe[0]).trim()))
        .slice(0, 3);

      if (tab === 'possible') setRecipesPossible(cleaned);
      else setRecipesNeeds(cleaned);
    } catch (error) {
      console.log('[searchFromAI]', tab, error?.response?.status, error?.response?.data);
      Alert.alert('오류', '레시피를 추천받는 중 문제가 발생했습니다.');
    } finally {
      // 탭별 로딩 종료
      if (tab === 'possible') setIsLoading(false);
      else setIsLoadingNeeds(false);
    }
  };


  // 기본 호출
  useEffect(() => {
    fetchRecipes('possible');
  }, []);

  // 탭 전환 시: 해당 탭 데이터 없으면 호출
  useEffect(() => {
    if (activeTab === 'needs' && recipesNeeds.length === 0) {
      fetchRecipes('needs');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // 현재 탭에 맞는 리스트
  const recipes = activeTab === 'possible' ? recipesPossible : recipesNeeds;

  // 로딩 화면 노출
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <StatusBar hidden={true} />
        <LoadingScreen />
      </View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(800).springify().damping(12)} style={{flex: 1}}>
      <StatusBar hidden={true} />
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 rounded-full ml-1 bg-gr">
            <ChevronLeftIcon strokeWidth={4.5} color="#fbbf24" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI 추천 레시피</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} className="p-2 rounded-full ml-1 bg-gr">
            <FontAwesome name="home" size={24} color="#fbbf24" />
          </TouchableOpacity>
        </View>

        {/* 탭 메뉴 */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'possible' && styles.activeTab]}
            onPress={() => setActiveTab('possible')}
          >
            <Text style={activeTab === 'possible' ? styles.activeTabText : undefined}>추천 레시피</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'needs' && styles.activeTab]}
            onPress={() => setActiveTab('needs')}
          >
            <Text style={activeTab === 'needs' ? styles.activeTabText : { color: '#9ca3af' }}>추가 재료 필요</Text>
          </TouchableOpacity>
        </View>

        {/* 본문 */}
        <View style={{ flex: 1 }}>
          <ScrollView>
            {recipes.length > 0 ? (
              recipes
                .filter(r => !!(r?.recipe?.[0] && String(r.recipe[0]).trim()))
                .slice(0, 3)
                .map((item, index) => (
                  <Item
                    key={index}
                    recipe={item}
                    onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
                  />
                ))
            ) : (
              // 로딩 종류 분할
              activeTab === 'needs' && isLoadingNeeds ? (
                <View style={{ alignItems: 'center', marginTop: hp(20) }}>
                  <ActivityIndicator size="large" color="#fbbf24" />
                  <Text style={{ marginTop: 6, color: '#6b7280' }}>
                    추가 재료 포함 추천을 불러오는 중…
                  </Text>
                </View>
              ) : (
                <View style={{ alignItems: 'center', marginTop: hp(20) }}>
                  <Text style={{ fontSize: hp(2), color: '#6b7280' }}>
                    추천할 수 있는 레시피가 없습니다.
                  </Text>
                </View>
              )
            )}
          </ScrollView>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: {
    paddingTop: hp(7),
    paddingBottom: hp(2),
    paddingHorizontal: wp(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  headerTitle: { fontSize: hp(2.5), fontWeight: 'bold' },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f3f4f6',
    paddingVertical: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#fbbf24',
  },
  activeTabText: {
    color: '#111827',
    fontWeight: '600' 
  },
});