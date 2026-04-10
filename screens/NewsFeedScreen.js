import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, RefreshControl,
  StyleSheet, ActivityIndicator, TextInput, Switch, ScrollView
} from 'react-native';
import axios from 'axios';
import Sentiment from 'sentiment';
import { useTheme } from '../ThemeContext';

const API_KEY = '932ed86981ba4a59a600b7e0c1d3d864';  
const PAGE_SIZE = 15;
const sentimentAnalyzer = new Sentiment();

const NewsFeedScreen = ({ route, navigation }) => {
  const { category } = route.params;
  const { theme, isDark, toggleTheme } = useTheme();

  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'positive' | 'negative'

  // Sentiment History
  const [sentimentHistory, setSentimentHistory] = useState([]);

  const analyzeSentiment = (text) => {
    const result = sentimentAnalyzer.analyze(text || '');
    return {
      score: result.score,
      comparative: result.comparative,
    };
  };

  const fetchNews = async (pageNum = 1, isRefresh = false) => {
    if (loading) return;
    setLoading(true);

    try {
      let url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}&pageSize=${PAGE_SIZE}&page=${pageNum}`;
      if (category) url += `&category=${category}`;

      const response = await axios.get(url);

      const articlesWithSentiment = response.data.articles.map(article => ({
        ...article,
        sentiment: analyzeSentiment(article.title + ' ' + (article.description || '')),
      }));

      if (isRefresh) {
        setArticles(articlesWithSentiment);
      } else {
        setArticles(prev => [...prev, ...articlesWithSentiment]);
      }

      // Add to sentiment history (average positive score of current page)
      const pageAverage = articlesWithSentiment.reduce((sum, item) => sum + item.sentiment.score, 0) / articlesWithSentiment.length;
      setSentimentHistory(prev => [...prev, { page: pageNum, score: parseFloat(pageAverage.toFixed(2)) }]);

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
    setSentimentHistory([]);
    fetchNews(1, true);
  };

  const loadMore = () => {
    if (!loading) fetchNews(page + 1);
  };

  // Filter articles
  const filteredArticles = useMemo(() => {
    let result = articles.filter(article =>
      article.title?.toLowerCase().includes(search.toLowerCase())
    );

    if (filter === 'positive') {
      result = result.filter(a => a.sentiment.score > 0.5);
    } else if (filter === 'negative') {
      result = result.filter(a => a.sentiment.score < -0.5);
    }

    return result;
  }, [articles, search, filter]);

  const getSentimentColor = (score) => {
    if (score > 0.5) return '#4CAF50';   // Positive
    if (score < -0.5) return '#F44336';  // Negative
    return '#888';                       // Neutral
  };

  const renderItem = ({ item }) => {
    const color = getSentimentColor(item.sentiment.score);
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card }]}
        onPress={() => navigation.navigate('Article', { url: item.url, title: item.title })}
      >
        {item.urlToImage && <Image source={{ uri: item.urlToImage }} style={styles.image} />}

        <View style={styles.cardContent}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.sentimentRow}>
            <View style={[styles.sentimentDot, { backgroundColor: color }]} />
            <Text style={[styles.source, { color: theme.accent }]}>
              {item.source.name}
            </Text>
            <Text style={[styles.sentimentScore, { color }]}>
              {item.sentiment.score > 0 ? '+' : ''}{item.sentiment.score.toFixed(1)}
            </Text>
          </View>

          <Text style={styles.date}>
            {new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {category ? category.toUpperCase() : 'Daily News'}
        </Text>
        <Switch value={isDark} onValueChange={toggleTheme} thumbColor={theme.accent} />
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search news..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Sentiment Filter */}
      <View style={styles.filterContainer}>
        {['all', 'positive', 'negative'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.filterButton, filter === type && styles.filterButtonActive]}
            onPress={() => setFilter(type)}
          >
            <Text style={[styles.filterText, filter === type && styles.filterTextActive]}>
              {type === 'all' ? 'All' : type === 'positive' ? 'Positive' : 'Negative'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sentiment History */}
      {sentimentHistory.length > 0 && (
        <View style={styles.historyContainer}>
          <Text style={[styles.historyTitle, { color: theme.text }]}>Sentiment History</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {sentimentHistory.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyPage}>P{item.page}</Text>
                <Text style={[styles.historyScore, { color: item.score > 0 ? '#4CAF50' : '#F44336' }]}>
                  {item.score > 0 ? '+' : ''}{item.score}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

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
  filterContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  filterButton: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0' },
  filterButtonActive: { backgroundColor: '#F891BB' },
  filterText: { fontWeight: '600', color: '#555' },
  filterTextActive: { color: '#fff' },
  historyContainer: { paddingHorizontal: 16, marginBottom: 8 },
  historyTitle: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  historyItem: { backgroundColor: '#fff', padding: 10, borderRadius: 12, marginRight: 8, alignItems: 'center', minWidth: 60 },
  historyPage: { fontSize: 12, color: '#666' },
  historyScore: { fontSize: 16, fontWeight: '700' },
  card: { marginHorizontal: 12, marginVertical: 8, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, elevation: 8 },
  image: { width: '100%', height: 200, resizeMode: 'cover' },
  cardContent: { padding: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  sentimentRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  sentimentDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  source: { fontWeight: '600', fontSize: 14, flex: 1 },
  sentimentScore: { fontSize: 14, fontWeight: '700' },
  date: { fontSize: 12, color: '#888' },
});

export default NewsFeedScreen;