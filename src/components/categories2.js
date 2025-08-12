import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import {categoryData} from '../constants'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CachedImage } from '../helpers/image';

// 재료 선택 컴포넌트에서의 카테고리

export default function Categories2({categories, activeCategory, handleChangeCategory}) {

  return (
    <Animated.View entering={FadeInDown.duration(500).springify()}>

      {/* 카테고리 선택 scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="space-x-4"
        contentContainerStyle={{paddingHorizontal: 15}}
      >
        {
            categories.map((cat, index)=>{
                let isActive = cat.strCategory==activeCategory;
                let activeButtonClass = isActive? ' bg-amber-400': ' bg-black/10';
                return (
                    <TouchableOpacity
                        key={index}
                        onPress={()=> handleChangeCategory(cat.strCategory)}
                        className="flex items-center space-y-1"
                    >
                        <View className={"rounded-full p-[6px] "+activeButtonClass}>
                          <Text className="font-semibold text-neutral-600" style={{fontSize: hp(1.6)}}>
                              {cat.strCategory}
                          </Text>
                        </View>
                        {/* 카테고리 내부 보여주기 */}
                        {/* <View>
                          <Text className="pt-15 justify-center items-center text-neutral-600 bg-gr" style={{ fontSize: hp(1.6)}}>
                            {isActive? cat.strCategory:' '}
                          </Text>
                        </View> */}
                    </TouchableOpacity>
                )
            })
        }
      </ScrollView>
    </Animated.View>
  )
}