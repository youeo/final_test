import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ChevronLeftIcon, ClockIcon } from 'react-native-heroicons/outline';
import { HeartIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Loading from '../components/loading';
import YouTubeIframe from 'react-native-youtube-iframe';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { getAuthToken } from '../AuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://43.200.200.161:8080';

const TOOLS_BIT_MAP = {
  '프라이팬': 1, '냄비': 2, '웍': 4, '밀대': 8, '믹서기': 16, '핸드블랜더': 32, '거품기': 64,
  '연육기': 128, '착즙기': 256, '전자레인지': 512, '가스레인지': 1024, '오븐': 2048,
  '에어프라이어': 4096, '주전자': 8192, '압력솥': 16384, '토스터': 32768, '찜기': 65536
};

const buildLikeBody = (meal, currentUser, route) => {
  const code = Number(meal?.code ?? 0) || 0;
  const type = Number(meal?.type ?? route?.params?.Type ?? 0) || 0;
  const tools = Number(currentUser?.tools ?? currentUser?.tool ?? meal?.tools ?? 0) || 0;

  return {
    code,
    name: meal?.name ?? '',
    time: meal?.time ?? '',
    recipe: Array.isArray(meal?.recipe) ? meal.recipe : [],
    mainIngredients: Array.isArray(meal?.mainIngredients) ? meal.mainIngredients : [],
    subIngredients: Array.isArray(meal?.subIngredients) ? meal.subIngredients : [],
    ingredients: Array.isArray(meal?.ingredients) ? meal.ingredients : [],
    thumbnail: meal?.thumbnail ?? '',
    type,
    tools,
    author: meal?.author ?? ''
  };
};

// 유저별로 구분되는 찜 키
const likedStorageKey = (uid, m) => {
  const code = Number(m?.code ?? 0) || 0;
  const name = String(m?.name ?? '');
  const time = String(m?.time ?? '');
  const safeUid = String(uid ?? 'guest');
  return `liked:${safeUid}:${code}:${name}:${time}`;
};

// code가 0 → 서버 발급 후 code가 바뀌면서 예전 키(0)로 저장된 항목을 못 지울 수 있음
// 현재 code 기준 키와 "code를 0으로 강제한 키" 둘 다 시도해서 정리
const likedCandidateKeys = (uid, m) => {
  const name = String(m?.name ?? '');
  const time = String(m?.time ?? '');
  const safeUid = String(uid ?? 'guest');

  const codeNow = Number(m?.code ?? 0) || 0;
  const keyNow  = `liked:${safeUid}:${codeNow}:${name}:${time}`;
  const keyZero = `liked:${safeUid}:0:${name}:${time}`;

  return Array.from(new Set([keyNow, keyZero]));
};

export default function RecipeDetailScreen(props) {
  const recipe = props.route.params?.recipe;

  const navigation = useNavigation();
  const didInit = useRef(false);

  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isFavourite, setIsFavourite] = useState(false);
  const [liking, setLiking] = useState(false);

  const [authHeaders, setAuthHeaders] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);  // uid / tools 등

  // 토큰과 /api/me 준비
  useEffect(() => {
    let mounted = true;
    const prepareAuth = async () => {
      try {
        const token = await getAuthToken();
        if (!token) {
          setAuthHeaders(null);
          setCurrentUser(null);
          return;
        }
        const auth = /^Bearer\s/i.test(token) ? token : `Bearer ${token}`;
        const headers = { Authorization: auth, 'Content-Type': 'application/json', Accept: 'application/json' };
        if (!mounted) return;

        setAuthHeaders(headers);

        try {
          const me = await axios.get(`${API_BASE_URL}/api/me`, { headers, timeout: 10000 });
          if (!mounted) return;
          setCurrentUser(me?.data ?? null);
        } catch {
          setCurrentUser(null);
        }
      } catch {
        setAuthHeaders(null);
        setCurrentUser(null);
      }
    };
    prepareAuth();
    return () => { mounted = false; };
  }, []);

  // 초기 세팅: recipe 바인딩 및 로컬/서버 liked 복구
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    setMeal(recipe ?? null);

    const restore = async () => {
      try {
        // 1차: 서버가 내려준 liked
        if (typeof recipe?.liked === 'boolean') {
          setIsFavourite(recipe.liked);
        } else {
        // 2차: 로컬 저장소 확인(유저와 meal이 준비된 뒤에 다시 시도됨 - 아래 의존성 useEffect도 있음)
        }
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, [recipe]);

  // 유저/meal 준비 후 로컬 저장소에서 liked 복구 (서버 liked가 없을 때)
  useEffect(() => {
    const restoreFromLocal = async () => {
      if (!meal) return;
      if (typeof recipe?.liked === 'boolean') return; // 이미 서버값으로 복구됨
      const uid = currentUser?.id ?? currentUser?.userId ?? currentUser?.uid ?? 'guest';
      try {
        const key = likedStorageKey(uid, meal);
        const v = await AsyncStorage.getItem(key);
        if (v === '1') setIsFavourite(true);
      } catch {}
    };
    restoreFromLocal();
  }, [meal, currentUser, recipe?.liked]);

  const hasIngredients = Array.isArray(meal?.ingredients) && meal.ingredients.length > 0;

  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regex = /[?&]v=([^&]+)/;
    const match = url.match(regex);
    return match?.[1] || null;
  };

  const imageSource = meal?.thumbnail
    ? { uri: meal.thumbnail }
    : require('../../assets/images/placeholder.jpg');

  // 찜 토글
  const toggleLike = async () => {
    if (!meal || liking) return;

    try {
      // 인증 준비 체크
      if (!authHeaders) {
        Alert.alert('로그인 필요', '이 기능을 사용하려면 로그인하세요.');
        return;
      }
      setLiking(true);

      
      if (!isFavourite) {
        const uid = currentUser?.id ?? currentUser?.userId ?? currentUser?.uid ?? 'guest';
        const key = likedStorageKey(uid, meal);

        // 중복 방지: 이미 로컬에 있으면 서버로 안 보냄
        const exists = await AsyncStorage.getItem(key);
        if (exists === '1') {
          setIsFavourite(true);
          return;
        }

        const body = buildLikeBody(meal, currentUser, props.route);
        const res = await axios.post(`${API_BASE_URL}/api/recipes/like`, body, { headers: authHeaders, timeout: 15000 });

        // 서버가 성공값 반환
        const newCode = Number(res?.data ?? 0);

        // 하트/상태 즉시 반영
        setIsFavourite(true);

        // meal 상태 업데이트
        setMeal(prev => ({
          ...(prev || {}),
          liked: true,
          ...(Number.isFinite(newCode) && newCode > 1 ? { code: newCode } : {})
        }));

        // route params도 업데이트 (뒤로 갔다 돌아와도 유지)
        const prevRecipe = props.route.params?.recipe || {};
        props.navigation.setParams({
          recipe: {
            ...prevRecipe,
            liked: true,
            ...(Number.isFinite(newCode) && newCode > 1 ? { code: newCode } : {})
          }
        });

        // 로컬 기록 저장 → 중복 방지
        await AsyncStorage.setItem(key, '1');
      } else {
        // 해제: 서버에 등록된 code 필요
        const uid = currentUser?.id ?? currentUser?.userId ?? currentUser?.uid ?? 'guest';
        const keys = likedCandidateKeys(uid, meal);
        const recipeCode = Number(meal?.code ?? 0) || 0;

        // 확인 팝업
        Alert.alert(
          '찜 취소',
          `"${meal?.name || '레시피'}" 찜을 취소하시겠습니까?`,
          [
            { text: '아니요', style: 'cancel' },
            {
              text: '네',
              style: 'destructive',
              onPress: async () => {
                try {
                  // 서버에 등록된 code가 있으면 DELETE 호출
                  if (recipeCode > 0) {
                    await axios.delete(`${API_BASE_URL}/api/recipes/like`, {
                      params: { recipeCode },
                      headers: authHeaders,
                      timeout: 15000
                    });
                  } else {
                    // code=0이면 서버 삭제 불가 → 로컬만 정리
                    console.log('[unlike] code=0 → local-only cleanup');
                  }

                  // UI 상태 동기화
                  setIsFavourite(false);
                  setMeal(prev => ({ ...(prev || {}), liked: false }));

                  // 뒤로 갔다 돌아와도 유지되도록 route params도 갱신
                  const prevRecipe = props.route.params?.recipe || {};
                  props.navigation.setParams({ recipe: { ...prevRecipe, liked: false } });

                  // 로컬 저장 키 전부 제거(현재 code 키, code=0 키 둘 다)
                  for (const k of keys) {
                    await AsyncStorage.removeItem(k);
                  }

                  Alert.alert('완료', '찜이 취소되었습니다.');
                } catch (err) {
                  const s = err?.response?.status;
                  const d = typeof err?.response?.data === 'string'
                    ? err.response.data
                    : JSON.stringify(err?.response?.data ?? {});
                  console.log('[unlike] error:', s, d);
                  Alert.alert('오류', s ? `status=${s}\n${d}` : '찜 취소 중 오류가 발생했습니다.');
                } finally {
                  setLiking(false);
                }
              }
            }
          ]
        );
        return; // 팝업 비동기 콜백에서 setLiking 처리하므로 여기서 종료
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

  // 구분선 구현용
  const Divider = () => (
    <View
      style={{
        borderBottomColor: '#fbbf24',   // Tailwind amber-400
        borderBottomWidth: 1.5,           // 두께
        marginVertical: 12,
      }}
    >
      <View
        style={{
          borderBottomColor: '#fbbf24',
          borderBottomWidth: 2,       // 두 번째 선
          marginTop: 2,                 // 위 선과 간격
        }}
      />
    </View>
  );

  return (
    <ScrollView className="bg-white flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
      <StatusBar style={"light"} />

      <View className="flex-row justify-center">
        <View
          style={{
            width: wp(98),
            height: hp(10),
            borderRadius: 53,
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
            marginTop: 4,
            backgroundColor: '#ffffff' // 연한 회색 (빈칸 티나게)
          }}
        />
      </View>

      <Animated.View entering={FadeIn.delay(200).duration(1000)} className="w-full absolute flex-row justify-between items-center pt-14">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 rounded-full ml-5 bg-gr">
          <ChevronLeftIcon size={hp(3.5)} strokeWidth={4.5} color="#fbbf24" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleLike} disabled={liking} className="p-2 rounded-full mr-5 bg-gr">
          <HeartIcon size={hp(3.5)} strokeWidth={4.5} color={isFavourite ? "red" : "gray"} />
        </TouchableOpacity>
      </Animated.View>

      {loading ? (
        <Loading size="large" className="mt-16" />
      ) : (
        <View className="px-4 flex justify-between space-y-4 pt-8">

          {/* 이름 */}
          <Animated.View entering={FadeInDown.duration(700).springify().damping(12)}
            className="space-y-2"
          >
            <Text style={{ fontSize: hp(3) }} className="font-bold flex-1 text-neutral-700">
              {meal?.name ?? '이름 없는 레시피'}
            </Text>
            <Divider />
            {!!meal?.author && (
              <Text style={{ fontSize: hp(2) }} className="font-medium flex-1 text-neutral-500">
                by {meal.author}
              </Text>
            )}
          </Animated.View>

          {/* 시간 */}
          <Animated.View entering={FadeInDown.delay(100).duration(700).springify().damping(12)}
            style={{ marginTop: 10 }}
          >
            <Text style={{fontSize: hp(2.2), fontWeight: '700', color: '#374151', marginBottom: 8 }}>
              Time
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: 8
              }}
            >
              <View
                style={{
                  backgroundColor: '#fbbf24',
                  borderRadius: 9999,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: '#e5e7eb'
                }}
              >
                <Text style={{ color: '#374151', fontWeight: '600' }}>
                  ⏱ {meal?.time || 'N/A'}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* 도구 */}
          <Animated.View
            entering={FadeInDown.delay(120).duration(700).springify().damping(12)}
            style={{ marginTop: 10 }}
          >
            <Text style={{fontSize: hp(2.2), fontWeight: '700', color: '#374151', marginBottom: 8 }}>
              Tools
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: 8
              }}
            >
              <View
                style={{
                  backgroundColor: '#fff7ed',
                  borderRadius: 9999,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: '#fed7aa'
                }}
              >
                <Text style={{ color: '#9a3412', fontWeight: '600' }}>
                  {TOOLS_BIT_MAP[meal?.tools] ?? "없음"}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* 재료 */}
          {Array.isArray(meal?.mainIngredients) && meal.mainIngredients.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(160).duration(700).springify().damping(12)}
              style={{ marginTop: 16 }}
            >
              <Text style={{ fontSize: hp(2.2), fontWeight: '700', color: '#374151', marginBottom: 8 }}>
                Ingredients
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {meal.mainIngredients.map((ing, idx) => (
                  <View
                    key={`main-${idx}`}
                    style={{
                      backgroundColor: '#fff7ed',
                      borderColor: '#fed7aa',
                      borderWidth: 1,
                      borderRadius: 9999,
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      marginRight: 8,
                      marginBottom: 8
                    }}
                  >
                    <Text style={{ color: '#9a3412', fontWeight: '600' }}>
                      {(ing?.name ?? '').toString()}
                      {ing?.count ? ` ${ing.count}` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* 서브 재료 (있으면 뜸) */}
          {Array.isArray(meal?.subIngredients) && meal.subIngredients.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(180).duration(700).springify().damping(12)}
              style={{ marginTop: 8 }}
            >
              <Text style={{ fontSize: hp(2.2), fontWeight: '700', color: '#374151', marginBottom: 8 }}>
                Sub Ingredients
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {meal.subIngredients.map((ing, idx) => (
                  <View
                    key={`sub-${idx}`}
                    style={{
                      backgroundColor: '#eef2ff',
                      borderColor: '#c7d2fe',
                      borderWidth: 1,
                      borderRadius: 9999,
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      marginRight: 8,
                      marginBottom: 8
                    }}
                  >
                    <Text style={{ color: '#3730a3', fontWeight: '600' }}>
                      {(ing?.name ?? '').toString()}
                      {ing?.count ? ` ${ing.count}` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {!!meal?.recipe?.length && (
            <Animated.View entering={FadeInDown.delay(300).duration(700).springify().damping(12)} className="space-y-4">
              <Divider />
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