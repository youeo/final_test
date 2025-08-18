import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import { CachedImage } from '../helpers/image';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { ChevronLeftIcon, ClockIcon, FireIcon } from 'react-native-heroicons/outline';
import {  HeartIcon, Square3Stack3DIcon, UsersIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Loading from '../components/loading';
import YouTubeIframe from 'react-native-youtube-iframe';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';


export default function RecipeDetailScreen(props) {
  const recipe = props.route.params?.recipe;

  const [isFavourite, setIsFavourite] = useState(false);
  const navigation = useNavigation();

  // 기존 state/로딩 로직 단순화
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // themealdb 호출 대신, 넘어온 데이터를 그대로 사용
    if (recipe) {
      setMeal(recipe);
    }
    setLoading(false);
  }, [recipe]);

  // 기존 themealdb 헬퍼 대체: 우리 스키마 기준
  // ingredients가 별도 배열로 오지 않으면 섹션 숨김
  const hasIngredients = Array.isArray(meal?.ingredients) && meal.ingredients.length > 0;

  // YouTube가 있으면 렌더 (없으면 섹션 숨김)
  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regex = /[?&]v=([^&]+)/;
    const match = url.match(regex);
    return match?.[1] || null;
  };

  // 이미지: 서버에 썸네일 없을 수 있으니 placeholder **여기 이미지도 없으면 제거햐야 할 듯 합니다..
  const imageSource = meal?.thumbnail
    ? { uri: meal.thumbnail }
    : require('../../assets/images/placeholder.jpg');

  return (
    <ScrollView className="bg-white flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
      <StatusBar style={"light"} />

      {/* recipe image */}
      <View className="flex-row justify-center">
        <Image
          source={imageSource}
          style={{ width: wp(98), height: hp(50), borderRadius: 53, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, marginTop: 4 }}
          resizeMode="cover"
        />
      </View>

      {/* 뒤로가기/좋아요 */}
      <Animated.View entering={FadeIn.delay(200).duration(1000)} className="w-full absolute flex-row justify-between items-center pt-14">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 rounded-full ml-5 bg-white">
          <ChevronLeftIcon size={hp(3.5)} strokeWidth={4.5} color="#fbbf24" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsFavourite(!isFavourite)} className="p-2 rounded-full mr-5 bg-white">
          <HeartIcon size={hp(3.5)} strokeWidth={4.5} color={isFavourite ? "red" : "gray"} />
        </TouchableOpacity>
      </Animated.View>

      {/* 본문 */}
      {loading ? (
        <Loading size="large" className="mt-16" />
      ) : (
        <View className="px-4 flex justify-between space-y-4 pt-8">
          {/* name and area(우리 스키마엔 area 없을 수 있으니 name만) */}
          <Animated.View entering={FadeInDown.duration(700).springify().damping(12)} className="space-y-2">
            <Text style={{ fontSize: hp(3) }} className="font-bold flex-1 text-neutral-700">
              {meal?.name ?? '이름 없는 레시피'}
            </Text>
            {!!meal?.author && (
              <Text style={{ fontSize: hp(2) }} className="font-medium flex-1 text-neutral-500">
                by {meal.author}
              </Text>
            )}
          </Animated.View>

          {/* 시간 표시 */}
          <Animated.View entering={FadeInDown.delay(100).duration(700).springify().damping(12)} className="flex-row justify-center items-center">
            <View 
              style={{ backgroundColor: '#fbbf24', borderRadius: 9999, paddingVertical: 16, paddingHorizontal: 20, minWidth: wp(25), alignItems: 'center', justifyContent: 'center'}}
              >
                <View style={{height: hp(6.5), width: hp(6.5), borderRadius: 9999, backgroundColor: 'white',
                    alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}
                >
                  <ClockIcon size={hp(4)} strokeWidth={2.5} color="#525252" />
                </View>
                <Text style={{ fontSize: hp(2), fontWeight: 'bold', color: '#111827', textAlign: 'center', flexWrap: 'wrap' }}>
                  {meal?.time}
                </Text>
                <Text style={{ fontSize: hp(1.3), fontWeight: '600', color: '#111827', marginTop: 4, textAlign: 'center' }}>
                  Time
                </Text>
            </View>
            {/* 나머지 통계칸은 필요 시 데이터 맞춰 채우기 */}
          </Animated.View>

          {/* ingredients: 배열이 있을 때만 */}
          {hasIngredients && (
            <Animated.View entering={FadeInDown.delay(200).duration(700).springify().damping(12)} className="space-y-4">
              <Text style={{ fontSize: hp(2.5) }} className="font-bold flex-1 text-neutral-700">Ingredients</Text>
              <View className="space-y-2 ml-3">
                {meal.ingredients.map((ing, idx) => (
                  <View key={`${ing.name ?? 'ing'}-${idx}`} className="flex-row space-x-4">
                    <View style={{ height: hp(1.5), width: hp(1.5) }} className="bg-amber-300 rounded-full" />
                    <View className="flex-row space-x-2">
                      {!!ing.count && (
                        <Text style={{ fontSize: hp(1.7) }} className="font-extrabold text-neutral-700">{ing.count}</Text>
                      )}
                      <Text style={{ fontSize: hp(1.7) }} className="font-medium text-neutral-600">{ing.name}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* instructions: 서버의 recipe 배열(문장들) */}
          {!!meal?.recipe?.length && (
            <Animated.View entering={FadeInDown.delay(300).duration(700).springify().damping(12)} className="space-y-4">
              <Text style={{ fontSize: hp(2.5) }} className="font-bold flex-1 text-neutral-700">Instructions</Text>
              <View className="space-y-2">
                {meal.recipe.map((step, idx) => (
                  <Text key={idx} style={{ fontSize: hp(1.6) }} className="text-neutral-700">
                    {idx + 1}. {String(step)}
                  </Text>
                ))}
              </View>
            </Animated.View>
          )}

          {/* YouTube: url 있으면 표시 */}
          {!!meal?.youtube && getYoutubeVideoId(meal.youtube) && (
            <Animated.View entering={FadeInDown.delay(400).duration(700).springify().damping(12)} className="space-y-4">
              <Text style={{ fontSize: hp(2.5) }} className="font-bold flex-1 text-neutral-700">Recipe Video</Text>
              <View>
                <YouTubeIframe videoId={getYoutubeVideoId(meal.youtube)} height={hp(30)} />
              </View>
            </Animated.View>
          )}
        </View>
      )}
    </ScrollView>
  );
}