import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, TextInput, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';
import { AntDesign } from '@expo/vector-icons';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getAuthToken } from '../../AuthService';

const API_BASE_URL = 'http://43.200.200.161:8080';

const Item = ({ recipe }) => (
  <ScrollView className="mx-5" style={{ marginTop: 15 }} showsHorizontalScrollIndicator={false}>
    <View
      style={{ flex: 1, flexDirection: 'row', backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' }}
      className="space-x-2 rounded-2xl px-3 py-3"
    >
      <View style={{ flex: 0.3, justifyContent: 'center' }}>
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
        <Text className="text-sm text-gray-600" numberOfLines={2}>
          {recipe.recipe?.[0] || '레시피 설명이 없습니다.'}
        </Text>
      </View>
    </View>
  </ScrollView>
);

export default function RecommendScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { mainIngredients, subIngredients } = route.params || {};

  const [activeTab, setActiveTab] = useState('possible');
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        const token = await getAuthToken();
        if (!token) {
          Alert.alert("로그인 필요", "레시피를 추천받으려면 로그인이 필요합니다.");
          navigation.navigate('LoginScreen');
          return;
        }

        // ## 1. /api/me를 호출해서 현재 사용자 정보를 가져옵니다. ##
        const userResponse = await axios.get(`${API_BASE_URL}/api/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const currentUser = userResponse.data;

        const requestData = {
          mainIngredients: mainIngredients?.[0] || null, // 메인 재료는 하나만 전달
          subIngredients: [...(mainIngredients?.slice(1) || []), ...(subIngredients || [])],
          // ## 2. 하드코딩된 값 대신 실제 사용자 정보를 사용합니다. ##
          Banned: currentUser.banned, 
          Tool: currentUser.tools
        };

        // ## 3. AI 서버에 올바른 경로로 요청을 보냅니다. ##
        const recipeResponse = await axios.post(`${API_BASE_URL}/api/recipes/searchFromAI`, requestData, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });

        if (recipeResponse && recipeResponse.data) {
          setRecipes(Array.isArray(recipeResponse.data) ? recipeResponse.data : []);
        }
      } catch (error) {
        console.error('[searchFromAI] Error:', error.response?.data || error.message);
        Alert.alert('오류', '레시피를 추천받는 중 문제가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, []);

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
            <Text>추천 레시피</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'needs' && styles.activeTab]}
            onPress={() => setActiveTab('needs')}
          >
            <Text style={{color: '#9ca3af'}}>추가 재료 필요 (준비중)</Text>
          </TouchableOpacity>
        </View>

        {/* 본문 */}
        <View style={{ flex: 1 }}>
          {isLoading ? (
            <ActivityIndicator style={{marginTop: hp(20)}} size="large" color="#fbbf24" />
          ) : (
            <ScrollView>
              {recipes.length > 0 ? (
                recipes.map((item, index) => <Item key={index} recipe={item} />)
              ) : (
                <View style={{alignItems: 'center', marginTop: hp(20)}}>
                    <Text style={{fontSize: hp(2), color: '#6b7280'}}>추천할 수 있는 레시피가 없습니다.</Text>
                </View>
              )}
            </ScrollView>
          )}
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
});