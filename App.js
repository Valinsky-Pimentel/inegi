import React, { useState, useEffect, createContext, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';

// Crear un contexto para la gestión del estado
const NewsContext = createContext();

const NewsProvider = ({ children }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRSS = async () => {
      try {
        console.log('Fetching RSS...');
        let response = await fetch('https://www.inegi.org.mx/rss/noticias/xmlfeeds?p=4,29');
        let responseText = await response.text();
        console.log('Response text:', responseText);

        const parser = new DOMParser();
        const xml = parser.parseFromString(responseText, 'application/xml');
        console.log('Parsed XML:', xml);

        const items = Array.from(xml.getElementsByTagName('item')).map(item => ({
          title: item.querySelector('title').textContent,
          description: item.querySelector('description').textContent,
          link: item.querySelector('link').textContent,
        }));
        
        console.log('Parsed items:', items); // Verificar la estructura de los datos obtenidos

        setNews(items);
      } catch (error) {
        console.error('Error fetching RSS:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRSS();
  }, []);

  useEffect(() => {
    console.log('Loading state:', loading);
  }, [loading]);

  return (
    <NewsContext.Provider value={{ news, loading }}>
      {children}
    </NewsContext.Provider>
  );
};

const NewsList = () => {
  const { news, loading } = useContext(NewsContext);
  const { width } = useWindowDimensions();

  useEffect(() => {
    console.log('News:', news);
  }, [news]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (news.length === 0) {
    return <Text style={styles.noNews}>No hay noticias disponibles.</Text>;
  }

  return (
    <FlatList
      data={news}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <View style={styles.itemContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <RenderHtml contentWidth={width} source={{ html: item.description }} />
        </View>
      )}
    />
  );
};

export default function App() {
  return (
    <NewsProvider>
      <View style={styles.container}>
        <Text style={styles.header}>Noticias INEGI</Text>
        <NewsList />
      </View>
    </NewsProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  itemContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noNews: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
  },
});
