import { View, Text, Image, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function TodaysIngredientScreen() {
  const navigation = useNavigation();
  const [ingredient, setIngredient] = useState(null);

  useEffect(() => {
    fetch('http://43.200.200.161:8080/Ingredienttoday')
      .then(res => res.json())
      .then(data => setIngredient(data))
      .catch(err => console.error(err));
  }, []);

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
          <Text style={{ fontSize: hp(2.3) }} className="font-semibold text-neutral-700 text-center mb-4">
            오늘의 식재료 상식
          </Text>

          {/* 이미지 */}
          {ingredient && (
            <View className="items-center">
              <Image
                source={{ uri: ingredient.image }}
                style={{ width: wp(80), height: hp(25), borderRadius: 20 }}
                className="bg-black/5"
                resizeMode="cover"
              />
            </View>
          )}

          {/* 이름 + 설명 */}
          {ingredient && (
            <View className="space-y-2 pt-4">
              <Text className="text-xl font-bold text-center">{ingredient.name}</Text>
              <Text className="text-base text-neutral-700 text-justify leading-6">
                {ingredient.description}
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
