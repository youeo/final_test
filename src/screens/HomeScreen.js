import { View, Text, ScrollView, Image, TextInput, StatusBar, TouchableOpacity, Pressable, FlatList} from 'react-native'
import React, { useEffect, useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';
import axios from 'axios';

import Recipes from '../components/recipes';
import Todaysfood from '../components/Todaysfood';

export default function HomeScreen() {

  const [meals, setMeals] = useState([]);
  const navigation = useNavigation();
  const [ingredient, setIngredient] = useState(null);

  async function safeFetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) {
      // 진짜 JSON일 수도 있으니 우선 text로 읽고 로깅
      const t = await res.text().catch(() => '');
      console.warn('[fetch not ok]', res.status, t);
      return null;
    }
    const text = await res.text();        // 먼저 text로 받기
    if (!text) return null;               // 빈 본문이면 null 반환
    try {
      return JSON.parse(text);
    } catch (e) {
      console.warn('[json parse fail]', e, text.slice(0, 120));
      return null;
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const mealsData = await safeFetchJson('http://43.200.200.161:8080/api/recipes/Recipetoday');
        setMeals(Array.isArray(mealsData) ? mealsData : []);

        const ingData = await safeFetchJson('http://43.200.200.161:8080/api/recipes/Ingredienttoday');
        setIngredient(ingData || null);
      } catch (err) {
        console.error('[home fetch error]', err);
        setMeals([]);
        setIngredient(null);
      }
    })();
  }, []);

  return (
    <View className="flex-1 bg-white">
      <StatusBar backgroundColor="#e8e9eb" barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        className="space-y-6 pt-10"
      >

        <Animated.View entering={FadeInDown.delay(100).duration(600).springify().damping(12)}>
          {/* 로고 */}
          <View style={{ height: 60, borderBottomWidth: 3, borderBottomColor: "#f2ca38" }} className="flex-row justify-between items-center mb-2 top-2 bottom-2 pb-2 pt-2 bg-black/10">
            <Image
              source={require('../../assets/images/recipppe.png')}
              style={{ marginLeft: 16, height: hp(3.2), width: hp(8.3) }}
            />
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Image
                source={require('../../assets/images/avatar.png')}
                style={{ marginRight: 16, height: hp(4.2), width: hp(4.3), borderRadius: 50,borderWidth: 3, borderColor: "#f2ca38" }}
              />
            </TouchableOpacity>
          </View>

          {/* 레시피 검색 & 나의 레시피 버튼 */}
          <View className="mt-8 flex-row mx-4 space-x-4 justify-center items-center">
            <Pressable
              className="flex justify-center mb-4 space-y-1"
              onPress={() => navigation.navigate('Select_cate')}
            >
              <View style={{ height: 180, width: 180 }} className="bg-gr rounded-3xl flex-col justify-center items-center">
                <Text style={{ fontSize: hp(2.8) }} className="font-semibold text-ye pb-3">레시피 검색</Text>
                <AntDesign name="search1" size={hp(5.5)} color="#ffab00" />
              </View>
            </Pressable>

            <Pressable
              className="flex justify-center mb-4 space-y-1"
              onPress={() => navigation.navigate('MyRecipe')}
            >
              <View style={{ height: 180, width: 180 }} className="bg-gr rounded-3xl flex-col justify-center items-center">
                <Text style={{ fontSize: hp(2.8) }} className="font-semibold text-ye pb-3">나의 레시피</Text>
                <AntDesign name="like2" size={hp(5.5)} color="#ffab00" />
              </View>
            </Pressable>
          </View>
        </Animated.View>

        {/* 오늘의 추천 레시피 */}
        <View className="-mt-10 mx-4 space-y-3">
          <View style={{ borderWidth: 3, borderColor: "#f2ca38" }} className="flex-row justify-between items-center pt-2 pb-2 bg-black/10 rounded-xl px-4">
            <Text style={{ fontSize: hp(2) }} className="font-semibold text-gr"> 오늘의 추천 레시피 </Text>
            <TouchableOpacity onPress={() => navigation.navigate('AiRecommend')}>
              <AntDesign name="doubleright" size={18} color="#43794b" />
            </TouchableOpacity>
          </View>

          {/* 추천 레시피 카드 */}
          <FlatList
            data={meals}   // 서버에서 가져온 5개 레시피
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity 
                className="mr-3"
                onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
              >
                <Image
                  source={{ uri: item.image }} // 서버에서 받은 레시피 이미지
                  className="w-32 h-32 rounded-xl"
                />
                <Text className="text-center mt-2" numberOfLines={1}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* 오늘의 식재료 상식 */}
        <View className="-mt-10 mx-4 space-y-3">
          <View style={{ borderWidth: 3, borderColor: "#f2ca38" }} className="flex-row justify-between items-center pt-2 pb-2 bg-black/10 rounded-xl px-4">
            <Text style={{ fontSize: hp(2) }} className="font-semibold text-gr">오늘의 식재료 상식</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TodaysIngredient')}>
              <AntDesign name="doubleright" size={18} color="#43794b" />
            </TouchableOpacity>
          </View>

          {/* 미리보기 카드 */}
          {ingredient && (
            <TouchableOpacity 
              className="items-center"
              onPress={() => navigation.navigate('TodaysIngredient')}
            >
              <Image
                source={{ uri: ingredient.image }} // 서버에서 받은 식재료 이미지
                className="w-40 h-40 rounded-xl"
              />
              <Text className="text-center mt-2" numberOfLines={1}>
                {ingredient.name}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
