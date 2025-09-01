import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { getAuthToken } from '../../AuthService';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import AntDesign from '@expo/vector-icons/AntDesign';

const API_BASE_URL = 'http://43.200.200.161:8080';

const TOOLS_BIT_MAP = {
  '프라이팬': 1, '냄비': 2, '웍': 4, '밀대': 8, '믹서기': 16, '핸드블랜더': 32, '거품기': 64,
  '연육기': 128, '착즙기': 256, '전자레인지': 512, '가스레인지': 1024, '오븐': 2048,
  '에어프라이어': 4096, '주전자': 8192, '압력솥': 16384, '토스터': 32768, '찜기': 65536
};

const POPULAR_TOOLS = {
    '기본도구': ['프라이팬', '냄비', '웍', '전자레인지', '가스레인지', '주전자'],
    '가열도구': ['오븐', '에어프라이어', '압력솥', '토스터', '찜기'],
    '보조도구': ['밀대', '믹서기', '핸드블랜더', '거품기', '연육기', '착즙기'],
};
const CATEGORIES = ['전체', '기본도구', '가열도구', '보조도구'];

const getBitsFromToolList = (toolList) => {
  let bits = 0;
  for (const name of toolList) {
    if (TOOLS_BIT_MAP[name]) {
      bits |= TOOLS_BIT_MAP[name];
    }
  }
  return bits;
};

export default function SelectToolScreen({ route, navigation }) {
  const { userData } = route.params;
  const insets = useSafeAreaInsets();

  const [selectedTools, setSelectedTools] = useState(userData.toolsList || []);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('전체');

  const toggleTool = (item) => {
    if (selectedTools.includes(item)) {
      setSelectedTools(selectedTools.filter(i => i !== item));
    } else {
      setSelectedTools([...selectedTools, item]);
    }
  };

  const handleSave = async () => {
    try {
        const token = await getAuthToken();
        const updatedUser = { 
            ...userData, 
            tools: getBitsFromToolList(selectedTools),
            toolsList: selectedTools 
        };
        await axios.put(`${API_BASE_URL}/api/update`, updatedUser, {
            headers: { Authorization: `Bearer ${token}` }
        });
        Alert.alert('성공', '조리도구 정보가 저장되었습니다.');
        navigation.goBack();
    } catch (error) {
        console.error('Failed to update tools:', error);
        Alert.alert('오류', '조리도구 정보 업데이트에 실패했습니다.');
    }
  };

  const renderTools = () => {
    let listToRender = [];
    if (activeCategory === '전체') {
      listToRender = Object.values(POPULAR_TOOLS).flat();
    } else {
      listToRender = POPULAR_TOOLS[activeCategory] || [];
    }

    const filteredList = listToRender.filter(item => item.includes(search));

    return filteredList.map((item, index) => {
        return (
            <TouchableOpacity
                key={index}
                style={styles.itemButton}
                onPress={() => toggleTool(item)}
            >
                <Text>{item}</Text>
            </TouchableOpacity>
        );
    });
  }

  return (
    <SafeAreaView style={{flex:1}} edges={['bottom','left','right']}>
      <View style={styles.container}>
        <StatusBar hidden={true} />
        
        {/* --- 헤더 UI 수정 --- */}
        <View style={styles.header}>
          <TouchableOpacity onPress={()=> navigation.goBack()} style={styles.headerButton}>
            <ChevronLeftIcon  strokeWidth={4.5} color="#fbbf24" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Text style={{fontSize: hp(2), color: '#fbbf24', fontWeight: 'bold'}}>저장</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>조리도구 선택</Text>
        </View>

        {/* --- 검색창 UI 수정 --- */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchBar}>
            <TextInput
              placeholder='조리도구 검색...'
              placeholderTextColor={'gray'}
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            <View style={styles.searchIconContainer}>
              <AntDesign name="search1" size={hp(2.5)} color="#ffab00"/>
            </View>
          </View>
        </View>

        {/* --- 카테고리 UI 수정 --- */}
        <View style={styles.categoryContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingHorizontal: 15}}
          >
            {CATEGORIES.map((category)=>{
              const isActive = category === activeCategory;
              return (
                <TouchableOpacity
                  key={category}
                  onPress={() => setActiveCategory(category)}
                  style={styles.categoryTouch}
                >
                  <View style={[styles.categoryPill, isActive ? styles.activeCategoryPill : styles.inactiveCategoryPill]}>
                    <Text style={styles.categoryText}>
                      {category}
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
        
        <View style={styles.listTitleContainer}>
          <Text style={styles.listTitle}>{activeCategory}</Text>
        </View>

        {/* --- 목록 UI 수정 --- */}
        <View style={styles.listContainer}>
          <ScrollView
            contentContainerStyle={styles.itemsContainer}
            keyboardShouldPersistTaps="handled"
          >
            {renderTools()}
          </ScrollView>
        </View>

        {/* --- 하단 선택 목록 UI 수정 --- */}
        <View style={styles.selectedBox}>
          <Text style={styles.selectedBoxTitle}>나의 조리도구</Text>
          <ScrollView horizontal keyboardShouldPersistTaps="handled">
            {selectedTools.map(item => (
              <View key={item} style={styles.selectedChip}>
                <Text>{item}</Text>
                <TouchableOpacity onPress={() => toggleTool(item)} style={{marginLeft: 5}}>
                  <Text>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

// --- recipe_search 스타일에 맞게 대폭 수정 ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: hp(7),
        paddingHorizontal: wp(5),
    },
    headerButton: {
        backgroundColor: '#f3f4f6', // bg-gr 대체
        padding: 10,
        borderRadius: 999,
    },
    titleContainer: {
        flex: 0.15,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: hp(2),
    },
    title: {
        fontSize: hp(3),
        fontWeight: 'bold',
        color: '#4b5563', // text-neutral-600
    },
    searchWrapper: {
        flex: 0.15,
        paddingHorizontal: wp(4),
        justifyContent: 'center',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 999,
        backgroundColor: 'rgba(0,0,0,0.05)',
        padding: 6,
    },
    searchInput: {
        flex: 1,
        fontSize: hp(1.7),
        paddingLeft: 12,
    },
    searchIconContainer: {
        backgroundColor: 'white',
        borderRadius: 999,
        padding: 8,
    },
    categoryContainer: {
        flex: 0.1,
        justifyContent: 'center',
    },
    categoryTouch: {
        alignItems: 'center',
        marginHorizontal: 4,
    },
    categoryPill: {
        borderRadius: 999,
        padding: 8,
    },
    activeCategoryPill: {
        backgroundColor: '#fbbf24', // amber-400
    },
    inactiveCategoryPill: {
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    categoryText: {
        fontWeight: '600',
        color: '#4b5563', // text-neutral-600
        marginHorizontal: 4,
        fontSize: hp(1.6),
    },
    listTitleContainer: {
        flex: 0.1,
        paddingHorizontal: wp(5),
        justifyContent: 'center',
    },
    listTitle: {
        fontSize: hp(2),
        fontWeight: 'bold',
        color: '#4b5563', // text-neutral-600
    },
    listContainer: {
        flex: 1,
    },
    itemsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: wp(4),
        paddingBottom: 8,
    },
    itemButton: {
        backgroundColor: '#d9d9d9',
        padding: 10,
        borderRadius: 20,
        margin: 5,
    },
    selectedBox: {
        backgroundColor: '#43794b',
        padding: 15,
        borderRadius: 20,
        marginVertical: 10,
        marginHorizontal: 12,
    },
    selectedBoxTitle: {
        color: 'white',
        marginBottom: 5,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    selectedChip: {
        backgroundColor: '#d9d9d9',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
        marginVertical: 5,
    },
});