import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { ChevronLeftIcon, ClockIcon, FireIcon } from 'react-native-heroicons/outline';
import {  HeartIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Loading from '../components/loading';
import YouTubeIframe from 'react-native-youtube-iframe';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { getAuthToken } from '../AuthService';

const API_BASE_URL = 'http://43.200.200.161:8080';

const buildLikeBody = (meal, currentUser, route) => {
  const code = Number(meal?.code ?? 0) || 0;
  const Type = Number(meal?.type ?? route?.params?.Type ?? 0) || 0;
  const Tool = Number(currentUser?.tools ?? currentUser?.tool ?? meal?.tools ?? 0) || 0;

  return {
    code,
    name: meal?.name ?? '',
    time: meal?.time ?? '',
    recipe: Array.isArray(meal?.recipe) ? meal.recipe : [],
    mainIngredients: Array.isArray(meal?.mainIngredients) ? meal.mainIngredients : [],
    subIngredients: Array.isArray(meal?.subIngredients) ? meal.subIngredients : [],
    ingredients: Array.isArray(meal?.ingredients) ? meal.ingredients : [],
    thumbnail: meal?.thumbnail ?? '',
    Type,
    Tool,
    author: meal?.author ?? ''
  };
};

export default function RecipeDetailScreen(props) {
  const recipe = props.route.params?.recipe;

  const [isFavourite, setIsFavourite] = useState(false);
  const navigation = useNavigation();

  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);

  const [liking, setLiking] = useState(false);

  useEffect(() => {
    if (recipe) {
      setMeal(recipe);
      // 찜 되어 있다면 상태 반영
      if (typeof recipe.liked === 'boolean') setIsFavourite(recipe.liked);
    }
    setLoading(false);
  }, [recipe]);

  // ingredients가 별도 배열로 오지 않으면 섹션 숨김
  const hasIngredients = Array.isArray(meal?.ingredients) && meal.ingredients.length > 0;

  // YouTube가 있으면 렌더 (없으면 섹션 숨김)
  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regex = /[?&]v=([^&]+)/;
    const match = url.match(regex);
    return match?.[1] || null;
  };

  // 이미지: 서버에 썸네일 없을 수 있으니 placeholder **여기 이미지도 없으면 제거해야 할 듯 합니다..
  const imageSource = meal?.thumbnail
    ? { uri: meal.thumbnail }
    : require('../../assets/images/placeholder.jpg');


  // 테스트 중 ---------------------------------------------------------------
  // 여러 키명 방어해서 code 추출
  const getRecipeCode = (obj) => {
    const raw = obj?.code ?? obj?.recipeCode ?? obj?.rCode ?? obj?.id ?? obj?.idRecipe ?? 0;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };

  // toggleLike 교체 (code=0도 허용하여 등록 가능, 성공 시 반환된 code로 업데이트)
  const toggleLike = async () => {
    if (!meal || liking) return;

    try {
      setLiking(true);

      let tokenRaw = await getAuthToken();
      if (!tokenRaw) {
        Alert.alert('로그인 필요', '이 기능을 사용하려면 로그인하세요.');
        return;
      }
      const auth = /^Bearer\s/i.test(tokenRaw) ? tokenRaw : `Bearer ${tokenRaw}`;
      const headers = { Authorization: auth, 'Content-Type': 'application/json', Accept: 'application/json' };

      // 사용자 정보(도구 코드 등 보정용)
      let currentUser = null;
      try {
        const me = await axios.get(`${API_BASE_URL}/api/me`, { headers, timeout: 10000 });
        currentUser = me?.data ?? null;
      } catch {}

      if (!isFavourite) {
        // 등록: code=0 허용, 서버가 매핑해서 실제 code 부여
        const body = buildLikeBody(meal, currentUser, props.route);
        console.log('[like][body]', JSON.stringify(body));
        const res = await axios.post(`${API_BASE_URL}/api/recipes/like`, body, { headers, timeout: 15000 });

        // 컨트롤러가 ResponseEntity<Integer> 반환 → 부여된 recipeCode(또는 1)일 수 있음
        const newCode = Number(res?.data);
        if (Number.isFinite(newCode) && newCode > 0) {
          // 성공적으로 코드가 발급됐다면 로컬 상태에 반영
          setMeal(prev => ({ ...(prev || {}), code: newCode }));
        }
        setIsFavourite(true);
      } else {
        // 해제: code가 있어야 DELETE 가능
        const recipeCode = Number(meal?.code ?? 0) || 0;
        if (recipeCode > 0) {
          await axios.delete(`${API_BASE_URL}/api/recipes/like`, {
            params: { recipeCode },
            headers,
            timeout: 15000
          });
          setIsFavourite(false);
        } else {
          // 아직 서버 코드가 없으면(=0) 해제는 불가 → 먼저 좋아요 등록해서 코드 발급 필요
          Alert.alert('안내', '서버에 등록된 코드가 없어 취소할 수 없어요. 먼저 찜 등록을 완료해 주세요.');
        }
      }
    } catch (err) {
      const s = err?.response?.status;
      const d = typeof err?.response?.data === 'string'
        ? err.response.data
        : JSON.stringify(err?.response?.data ?? {});
      console.log('[like] error:', s, d);
      Alert.alert('오류', s ? `status=${s}\n${d}` : '요청 처리 중 문제가 발생했습니다.');
    } finally {
      setLiking(false);
    }
  };


  // 테스트 중 ---------------------------------------------------------------

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
        <TouchableOpacity onPress={toggleLike} disabled={liking} className="p-2 rounded-full mr-5 bg-white">
          <HeartIcon size={hp(3.5)} strokeWidth={4.5} color={isFavourite ? "red" : "gray"} />
        </TouchableOpacity>
      </Animated.View>

      {/* 본문 */}
      {loading ? (
        <Loading size="large" className="mt-16" />
      ) : (
        <View className="px-4 flex justify-between space-y-4 pt-8">
          {/* 레시피 이름 */}
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