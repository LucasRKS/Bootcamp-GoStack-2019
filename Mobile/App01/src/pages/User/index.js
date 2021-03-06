import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';

import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  OwnerAvatar,
  Info,
  Title,
  Author,
  Reload,
  StarredButton,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loadingStars: false,
    page: 1,
    refreshing: false,
  };

  async componentDidMount() {
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    this.setState({ loadingStars: true });

    const response = await api.get(`/users/${user.login}/starred`);

    this.setState({ stars: response.data, loadingStars: false });
  }

  handleNavigate = repository => {
    const { navigation } = this.props;

    console.tron.log('aqui');

    navigation.navigate('StarredRepository', { repository });
  };

  async loadMoreStarred(user) {
    const { stars, page } = this.state;

    const pageNumber = page + 1;

    const response = await api.get(
      `/users/${user.login}/starred?page=${pageNumber}`
    );

    this.setState({ stars: [...stars, ...response.data], page: pageNumber });
  }

  async refreshList(user) {
    this.setState({ refreshing: true });

    const response = await api.get(`/users/${user.login}/starred`);

    this.setState({ stars: response.data, refreshing: false, page: 1 });
  }

  render() {
    const { navigation } = this.props;
    const { stars, loadingStars, refreshing } = this.state;
    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>
        {loadingStars ? (
          <Reload>
            <ActivityIndicator color="#FFF " size="large" />
          </Reload>
        ) : (
          <Stars
            onRefresh={() => this.refreshList(user)}
            refreshing={refreshing}
            onEndReachedThreshold={0.2}
            onEndReached={() => this.loadMoreStarred(user)}
            data={stars}
            keyExtractor={star => String(star.id)}
            renderItem={({ item }) => (
              <StarredButton onPress={() => this.handleNavigate(item)}>
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </StarredButton>
            )}
          />
        )}
      </Container>
    );
  }
}
