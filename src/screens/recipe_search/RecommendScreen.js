import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, TextInput } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation, useRoute } from '@react-navigation/native';
import MasonryList from '@react-native-seoul/masonry-list';
import axios from 'axios';
import LoadingScreen from './LoadingScreen';
import { StatusBar } from 'expo-status-bar';
import { AntDesign } from '@expo/vector-icons';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getAuthToken } from '../../AuthService';

const API_BASE_URL = 'http://43.200.200.161:8080';

const Item = ({ title, author, time, recipe }) => (
  <ScrollView className="mx-5" style={{ marginTop: 15 }} showsHorizontalScrollIndicator={true}>
    <View
      style={{ flex: 1, flexDirection: 'row', backgroundColor: '#ddd', borderWidth: 1, borderColor: '#bab8b8' }}
      className="space-x-2 rounded-2xl px-3 py-3"
    >
      <View style={{ flex: 0.3 }}>
        <Image
          source={require('../../../assets/images/placeholder.jpg')}
          style={{ width: 80, height: 80 }}
          className="rounded-full"
        />
      </View>
      <View style={{ flex: 0.6 }} className="space-y-2">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text className="font-semibold text-lg">{title}</Text>
          <Text className="text-xs text-gray-400">{author}</Text>
          <View
            style={{
              backgroundColor: '#fbbf24',
              borderRadius: 9999,
              paddingHorizontal: 10,
              paddingVertical: 4,
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'flex-start',
            }}
          >
            <Text className="text-xs text-white font-semibold">{time}</Text>
          </View>
        </View>
        <Text className="text-sm">
          {Array.isArray(recipe) && recipe.length > 0
            ? (String(recipe[0]).length > 15 ? `${String(recipe[0]).slice(0, 15)}...` : String(recipe[0]))
            : ''}
        </Text>
      </View>
      <View style={{ flex: 0.1 }} className="items-end justify-end">
        <AntDesign name="doubleright" size={hp(2)} color="black" onPress={() => {}} />
      </View>
    </View>
  </ScrollView>
);

export default function RecommendScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // 이전 화면에서 넘어온 파라미터 전달용
  const { mainIngredients, subIngredients } = route.params || {};

  const [showModal, setShowModal] = useState(true);
  const [activeTab, setActiveTab] = useState('possible');

  const [rec, setRec] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const testSearchFromAI = async () => {
    const url = `${API_BASE_URL}/recipes/searchFromAI`;

    // 안전한 기본값 (파라미터가 없을 때도 API가 깨지지 않게)
    const safeMain = Array.isArray(mainIngredients) ? mainIngredients : [];
    const safeSub = Array.isArray(subIngredients) ? subIngredients : [];

    // 요청 전달자들
    const requestData = {
      mainIngredients: safeMain,
      subIngredients: safeSub,
      Banned: 0,
      Tool: 1
    };

    try {
      let token = await getAuthToken();
      if (!token) {
        console.log('토큰 없음: 로그인 필요');
        setIsLoading(false);
        return;
      }
      if (!/^Bearer\s/i.test(token)) token = `Bearer ${token}`;
      console.log('[Recommend] token(head):', token.slice(0, 20), '...');
      console.log('[Recommend] requestData:', requestData);

      const response = await axios.post(url, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token,
        },
      });

      if (response && response.data) {
        setRec(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.log('[searchFromAI][status]', error?.response?.status);
      console.log('[searchFromAI][data]', error?.response?.data);
      console.log('[searchFromAI][headers]', error?.response?.headers);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testSearchFromAI();
  }, []);

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(800).springify().damping(12)} className="flex-1 space-y-4 flex-col">
      <StatusBar hidden={true} />
      <Modal visible={showModal} animationType="slide" transparent={false}>
        <View style={styles.container}>
          {/* 헤더 */}
          <View style={[styles.header, { backgroundColor: 'gray', flex: 0.1 }]} className="justify-between">
            <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 rounded-full ml-1 bg-gr">
              <ChevronLeftIcon strokeWidth={4.5} color="#fbbf24" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Home')} className="p-2 rounded-full ml-1 bg-gr">
              <FontAwesome name="home" size={24} color="#fbbf24" />
            </TouchableOpacity>
          </View>

          {/* 탭 메뉴 */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'possible' && styles.activeTab]}
              className="px-8 rounded-2xl"
              onPress={() => setActiveTab('possible')}
            >
              <Text>현재 가능한 레시피</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'needs' && styles.activeTab]}
              className="rounded-2xl"
              onPress={() => setActiveTab('needs')}
            >
              <Text>추가 재료가 필요한 레시피</Text>
            </TouchableOpacity>
          </View>

          {/* 정렬 */}
          <TouchableOpacity style={styles.sort} className="my-1 mb-4">
            <Text>
              정렬기준 <AntDesign name="filter" size={15} />
            </Text>
          </TouchableOpacity>

          {/* search bar */}
          <View style={{ flex: 0.15 }}>
            <View className="mx-4 flex-row item-center rounded-full bg-black/5 p-[6px]">
              <TextInput
                placeholder="레시피 검색..."
                placeholderTextColor={'gray'}
                style={{ fontSize: hp(1.5) }}
                className="flex-1 text-base mb-0 pl-3 tracking-wider"
              />
              <View className="bg-white rounded-full px-3 pt-2.5">
                <AntDesign name="search1" size={hp(2.5)} color="#ffab00" />
              </View>
            </View>
          </View>

          {/* 본문 */}
          <View style={{ flex: 0.85 }}>
            {isLoading ? (
              <LoadingScreen />
            ) : (
              <MasonryList
                data={rec}
                keyExtractor={(item) => String(item.code ?? `${item.name}-${item.author}-${item.time}`)}
                numColumns={1}
                showsHorizontalScrollIndicator={true}
                renderItem={({ item }) => (
                  <Item
                    title={item.name}
                    author={item.author}
                    time={item.time}
                    recipe={item.recipe}
                  />
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  headerTitle: { fontSize: 18, marginLeft: 10, fontWeight: 'bold' },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
  },
  tab: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#e0e0e0',
  },
  activeTab: {
    backgroundColor: '#ffab00',
  },
  sort: {
    alignSelf: 'flex-end',
    padding: 10,
    marginRight: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ccc',
    marginRight: 10,
  },
  cardContent: {
    flex: 1,
  },
  title: { fontSize: 16, fontWeight: 'bold' },
  description: { fontSize: 12, color: '#666' },
});