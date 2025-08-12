import { View, Text, Image, ScrollView, TouchableOpacity, StatusBar, FlatList, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import axios from 'axios';

export default function AiRecommendScreen() {
  const navigation = useNavigation();
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    getRecommendedRecipes();
  }, []);

  const getRecommendedRecipes = async () => {
    try {
      const response = await axios.get('https://themealdb.com/api/json/v1/1/search.php?s=');
      if (response?.data?.meals) {
        setMeals(response.data.meals.slice(0, 5)); // 최대 5개
      }
    } catch (err) {
      console.log('Error fetching recipes: ', err.message);
    }
  };

  const numColumns = 2;
  const imageSize = (Dimensions.get('window').width - wp(12)) / 2;

  return (
    <View className="flex-1 bg-white">
      <StatusBar hidden={true} />
      
      {/* 뒤로가기 버튼 */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="absolute top-12 left-5 z-10 p-2 rounded-full bg-gr"
      >
        <ChevronLeftIcon size={hp(3.5)} strokeWidth={4.5} color="#fbbf24" />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: hp(12), paddingBottom: hp(5), paddingHorizontal: wp(5) }}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(600).springify().damping(12)}>
          {/* 제목 */}
          <Text style={{ fontSize: hp(2.3) }} className="font-semibold text-neutral-700 text-center mb-4">
            오늘의 추천 레시피
          </Text>

          {/* 레시피 이미지 목록 */}
          <FlatList
            data={meals}
            numColumns={numColumns}
            keyExtractor={(item) => item.idMeal}
            scrollEnabled={false}
            columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: hp(2) }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => navigation.navigate('RecipeDetail', { ...item })}
              >
                <Image
                  source={{ uri: item.strMealThumb }}
                  style={{
                    width: imageSize,
                    height: hp(25),
                    borderRadius: 16,
                    backgroundColor: '#f3f3f3',
                  }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}
