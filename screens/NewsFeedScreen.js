import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, RefreshControl,
  StyleSheet, ActivityIndicator, TextInput, Switch
} from 'react-native';
import axios from 'axios';
import { useTheme } from '../ThemeContext';

const API_KEY = '932ed86981ba4a59a600b7e0c1d3d864';  
const PAGE_SIZE = 15;

const NewsFeedScreen = ({ route, navigation }) => {
  const category = route?.params?.category ?? null;
  const { theme, isDark, toggleTheme } = useTheme();

  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchNews = async (pageNum = 1, isRefresh = false) => {
    if (loading) return;
    setLoading(true);
    try {
      let url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}&pageSize=${PAGE_SIZE}&page=${pageNum}`;
      if (category) url += `&category=${category}`;

      const response = await axios.get(url);
      if (isRefresh) setArticles(response.data.articles);
      else setArticles(prev => [...prev, ...response.data.articles]);
    } catch (error) {
      alert('Failed to load news');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews(1);
  }, [category]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchNews(1, true);
  };

  const loadMore = () => {
    if (loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNews(nextPage);
  };

  const filteredArticles = articles.filter(article =>
    article.title?.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card }]}
      onPress={() => navigation.navigate('Article', { url: item.url, title: item.title })}
    >
      {item.urlToImage && <Image source={{ uri: item.urlToImage }} style={styles.image} />}
      <View style={styles.cardContent}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
        <Text style={[styles.source, { color: theme.accent }]}>{item.source.name}</Text>
        <Text style={styles.date}>{new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {category ? category.toUpperCase() : 'Daily News'}
        </Text>
        <Switch value={isDark} onValueChange={toggleTheme} thumbColor={theme.accent} />
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search news..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredArticles}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.accent]} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="large" color={theme.accent} style={{ margin: 30 }} /> : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  searchContainer: { margin: 12, padding: 12, borderRadius: 25, flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, fontSize: 16 },
  card: { marginHorizontal: 12, marginVertical: 8, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, elevation: 8 },
  image: { width: '100%', height: 200, resizeMode: 'cover' },
  cardContent: { padding: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  source: { fontWeight: '600', fontSize: 14 },
  date: { fontSize: 12, color: '#888', marginTop: 4 },
});

export default NewsFeedScreen;