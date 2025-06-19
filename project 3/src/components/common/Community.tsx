import React, { useState, useEffect } from 'react';
import { 
  MessageSquare,
  Users,
  Plus,
  Search,
  ThumbsUp,
  MessageCircle,
  Hash,
  TrendingUp,
  Clock,
  Pin,
  Star,
  Lock,
  Eye,
  UserPlus,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { motion, AnimatePresence } from 'framer-motion';
import { communityService } from '../../services/communityService';

export const Community: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { forumGroups, fetchForumGroups } = useAppStore();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch forum groups on mount
  useEffect(() => {
    fetchForumGroups();
  }, []);

  // Fetch posts when group is selected
  useEffect(() => {
    if (selectedGroup) {
      const fetchPosts = async () => {
        setIsLoading(true);
        try {
          const postsData = await communityService.getForumPosts(selectedGroup);
          setPosts(postsData);
        } catch (error) {
          console.error('Error fetching posts:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchPosts();
    } else {
      setPosts([]);
    }
  }, [selectedGroup]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    if (!newPostTitle.trim() || !newPostContent.trim() || !selectedGroup) return;

    try {
      setIsLoading(true);
      await communityService.createForumPost(
        selectedGroup,
        newPostTitle,
        newPostContent,
        // Optional tags could be extracted from content
        newPostTitle.split(' ')
          .filter(word => word.startsWith('#'))
          .map(tag => tag.substring(1))
      );
      
      // Refresh posts
      const postsData = await communityService.getForumPosts(selectedGroup);
      setPosts(postsData);
      
      // Reset form
      setNewPostTitle('');
      setNewPostContent('');
      setShowNewPost(false);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter groups based on search query
  const filteredGroups = forumGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedGroupData = forumGroups.find(group => group.id === selectedGroup);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'vor wenigen Minuten';
    if (diffInHours < 24) return `vor ${diffInHours} Stunden`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `vor ${diffInDays} Tagen`;
    return date.toLocaleDateString('de-DE');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-namuh-navy">Community Forum</h1>
          <p className="mt-2 text-gray-600">
            {isAuthenticated 
              ? 'Tauschen Sie sich mit anderen Bewerbern und Recruitern aus. Alle Beiträge werden anonym veröffentlicht.'
              : 'Lesen Sie anonyme Erfahrungen und Tipps von anderen Bewerbenden. Registrieren Sie sich für vollständigen Zugang.'
            }
          </p>
        </div>

        {/* Non-authenticated user banner */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="card p-6 bg-gradient-to-r from-namuh-teal/10 to-namuh-navy/10 border border-namuh-teal/20">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <Eye className="h-6 w-6 text-namuh-teal mr-3" />
                    <h3 className="text-lg font-semibold text-namuh-navy">Nur-Lesen Modus</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Sie können aktuell nur Beiträge von anderen Bewerbenden lesen. 
                    Für vollen Zugang, das Schreiben von Beiträgen und die Teilnahme an Diskussionen 
                    registrieren Sie sich kostenlos.
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 mr-1" />
                      <span>Schreiben gesperrt</span>
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      <span>Kommentieren gesperrt</span>
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      <span>Bewertungen gesperrt</span>
                    </div>
                  </div>
                </div>
                <div className="ml-6 flex flex-col space-y-3">
                  <Link to="/register" className="btn-primary flex items-center space-x-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Kostenlos registrieren</span>
                  </Link>
                  <Link to="/login" className="btn-outline flex items-center space-x-2">
                    <Zap className="h-4 w-4" />
                    <span>Bereits Mitglied?</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Groups Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-namuh-navy">Forum Gruppen</h2>
                {isAuthenticated ? (
                  <button className="p-2 text-namuh-teal hover:bg-namuh-teal/10 rounded-lg">
                    <Plus className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="p-2 text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                )}
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Gruppen suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-namuh-teal focus:border-transparent text-sm"
                />
              </div>

              {/* Groups List */}
              <div className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedGroup(null)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedGroup === null
                      ? 'bg-namuh-teal/10 text-namuh-teal border border-namuh-teal/20'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <Hash className="h-4 w-4" />
                    <span className="font-medium text-sm">Alle Beiträge</span>
                  </div>
                </motion.button>

                {isLoading && filteredGroups.length === 0 ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-namuh-teal"></div>
                  </div>
                ) : filteredGroups.length > 0 ? (
                  filteredGroups.map((group) => (
                    <motion.button
                      key={group.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedGroup(group.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedGroup === group.id
                          ? 'bg-namuh-teal/10 text-namuh-teal border border-namuh-teal/20'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <Hash className="h-4 w-4" />
                        <span className="font-medium text-sm">{group.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{group.description}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                        <span>{group.memberCount} Mitglieder</span>
                        <span>{group.postCount} Beiträge</span>
                      </div>
                    </motion.button>
                  ))
                ) : (
                  <div className="text-center p-4 text-gray-500">
                    <p>Keine Gruppen gefunden</p>
                  </div>
                )}
              </div>

              {/* Access Level Info for non-authenticated users */}
              {!isAuthenticated && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Lock className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium text-yellow-800">Eingeschränkter Zugang</span>
                  </div>
                  <p className="text-xs text-yellow-700">
                    Registrieren Sie sich für vollständigen Zugang zum Community-Forum.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedGroup || selectedGroup === null ? (
              <div className="space-y-6">
                {/* Group Header */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-namuh-navy flex items-center">
                        <Hash className="h-6 w-6 mr-2" />
                        {selectedGroupData ? selectedGroupData.name : 'Alle Beiträge'}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {selectedGroupData ? selectedGroupData.description : 'Alle Diskussionen von der Community'}
                      </p>
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {selectedGroupData ? selectedGroupData.memberCount : forumGroups.reduce((sum, g) => sum + g.memberCount, 0)} Mitglieder
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {selectedGroupData ? selectedGroupData.postCount : forumGroups.reduce((sum, g) => sum + g.postCount, 0)} Beiträge
                        </div>
                        {!isAuthenticated && (
                          <div className="flex items-center text-yellow-600">
                            <Eye className="h-4 w-4 mr-1" />
                            Nur-Lesen Modus
                          </div>
                        )}
                      </div>
                    </div>
                    {isAuthenticated ? (
                      <button
                        onClick={() => setShowNewPost(true)}
                        className="btn-primary"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Neuer Beitrag
                      </button>
                    ) : (
                      <div className="text-center">
                        <div className="p-3 bg-gray-100 rounded-lg mb-2">
                          <Lock className="h-6 w-6 text-gray-400 mx-auto" />
                        </div>
                        <p className="text-xs text-gray-500">Anmeldung erforderlich</p>
                      </div>
                    )}
                  </div>

                  {/* New Post Form - only for authenticated users */}
                  {isAuthenticated && showNewPost && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t pt-6"
                    >
                      <form onSubmit={handleCreatePost} className="space-y-4">
                        <div>
                          <input
                            type="text"
                            placeholder="Titel Ihres Beitrags..."
                            value={newPostTitle}
                            onChange={(e) => setNewPostTitle(e.target.value)}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <textarea
                            placeholder="Beschreiben Sie Ihr Anliegen oder Ihre Frage..."
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            rows={4}
                            className="input-field resize-none"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500">
                            Ihr Beitrag wird anonym als "{user?.role === 'applicant' ? 'Anonymer Bewerber' : 'Recruiter'}" veröffentlicht
                          </p>
                          <div className="flex space-x-3">
                            <button
                              type="button"
                              onClick={() => setShowNewPost(false)}
                              className="btn-outline"
                            >
                              Abbrechen
                            </button>
                            <button
                              type="submit"
                              disabled={!newPostTitle.trim() || !newPostContent.trim() || isLoading}
                              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                              {isLoading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  <span>Wird gespeichert...</span>
                                </>
                              ) : (
                                <span>Veröffentlichen</span>
                              )}
                            </button>
                          </div>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </div>

                {/* Posts List */}
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-namuh-teal"></div>
                    </div>
                  ) : posts.length > 0 ? (
                    posts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="card p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start space-x-4">
                          {/* Author Avatar */}
                          <div className="w-10 h-10 bg-namuh-teal rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-medium">
                              {post.authorType === 'applicant' ? 'A' : 'R'}
                            </span>
                          </div>

                          {/* Post Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              {post.isPinned && (
                                <Pin className="h-4 w-4 text-yellow-500" />
                              )}
                              <h3 className="text-lg font-semibold text-namuh-navy hover:text-namuh-teal cursor-pointer">
                                {post.title}
                              </h3>
                            </div>

                            <div className="flex items-center space-x-3 text-sm text-gray-500 mb-3">
                              <span>{post.authorName}</span>
                              <span>•</span>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatTimeAgo(post.createdDate)}
                              </div>
                            </div>

                            <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>

                            {/* Tags */}
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {post.tags.map((tag: string, tagIndex: number) => (
                                  <span
                                    key={tagIndex}
                                    className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Post Actions */}
                            <div className="flex items-center space-x-6 text-sm">
                              <button 
                                className={`flex items-center space-x-1 ${
                                  isAuthenticated 
                                    ? 'text-gray-500 hover:text-namuh-teal' 
                                    : 'text-gray-400 cursor-not-allowed'
                                }`}
                                disabled={!isAuthenticated}
                                onClick={async () => {
                                  if (isAuthenticated) {
                                    try {
                                      await communityService.upvotePost(post.id);
                                      // Refresh posts to get updated upvotes
                                      const postsData = await communityService.getForumPosts(selectedGroup);
                                      setPosts(postsData);
                                    } catch (error) {
                                      console.error('Error upvoting post:', error);
                                    }
                                  }
                                }}
                              >
                                <ThumbsUp className="h-4 w-4" />
                                <span>{post.upvotes}</span>
                                {!isAuthenticated && <Lock className="h-3 w-3 ml-1" />}
                              </button>
                              <button 
                                className={`flex items-center space-x-1 ${
                                  isAuthenticated 
                                    ? 'text-gray-500 hover:text-namuh-teal' 
                                    : 'text-gray-400 cursor-not-allowed'
                                }`}
                                disabled={!isAuthenticated}
                              >
                                <MessageCircle className="h-4 w-4" />
                                <span>{post.commentCount} Antworten</span>
                                {!isAuthenticated && <Lock className="h-3 w-3 ml-1" />}
                              </button>
                              <button 
                                className={`flex items-center space-x-1 ${
                                  isAuthenticated 
                                    ? 'text-gray-500 hover:text-yellow-500' 
                                    : 'text-gray-400 cursor-not-allowed'
                                }`}
                                disabled={!isAuthenticated}
                              >
                                <Star className="h-4 w-4" />
                                <span>Speichern</span>
                                {!isAuthenticated && <Lock className="h-3 w-3 ml-1" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                      <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Noch keine Beiträge</h3>
                      <p className="text-gray-500 mb-4">
                        Sei der Erste, der einen Beitrag in dieser Gruppe erstellt.
                      </p>
                      {isAuthenticated && (
                        <button 
                          onClick={() => setShowNewPost(true)}
                          className="btn-primary"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Beitrag erstellen
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* CTA for non-authenticated users */}
                {!isAuthenticated && posts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-8 text-center bg-gradient-to-r from-namuh-teal/10 to-namuh-navy/10 border border-namuh-teal/20"
                  >
                    <MessageSquare className="h-12 w-12 text-namuh-teal mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-namuh-navy mb-3">
                      Möchten Sie sich an der Diskussion beteiligen?
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                      Registrieren Sie sich kostenlos, um Beiträge zu schreiben, zu kommentieren, 
                      zu bewerten und auf alle Community-Features zuzugreifen. Bleiben Sie anonym und 
                      profitieren Sie vom Austausch mit anderen Fachkräften.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link to="/register" className="btn-primary flex items-center justify-center space-x-2">
                        <UserPlus className="h-5 w-5" />
                        <span>Jetzt kostenlos registrieren</span>
                      </Link>
                      <Link to="/login" className="btn-outline flex items-center justify-center space-x-2">
                        <Zap className="h-5 w-5" />
                        <span>Bereits Mitglied? Anmelden</span>
                      </Link>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      ✓ Kostenlos • ✓ Anonym • ✓ Keine Kreditkarte erforderlich
                    </p>
                  </motion.div>
                )}

                {/* Load More Button */}
                <div className="text-center">
                  {isAuthenticated && posts.length > 0 ? (
                    <button 
                      onClick={async () => {
                        if (selectedGroup) {
                          try {
                            setIsLoading(true);
                            const morePosts = await communityService.getForumPosts(
                              selectedGroup,
                              'newest',
                              20,
                              posts.length
                            );
                            setPosts([...posts, ...morePosts]);
                          } catch (error) {
                            console.error('Error loading more posts:', error);
                          } finally {
                            setIsLoading(false);
                          }
                        }
                      }}
                      className="btn-outline flex items-center justify-center"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          <span>Lädt...</span>
                        </>
                      ) : (
                        <span>Weitere Beiträge laden</span>
                      )}
                    </button>
                  ) : (
                    !isAuthenticated && posts.length > 0 && (
                      <div className="p-4 bg-gray-100 rounded-lg">
                        <Lock className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-3">
                          Mehr Beiträge verfügbar nach der Registrierung
                        </p>
                        <Link to="/register" className="btn-primary text-sm">
                          Registrieren für vollständigen Zugang
                        </Link>
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : (
              /* No group selected */
              <div className="card p-12 text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Wählen Sie eine Gruppe
                </h3>
                <p className="text-gray-600 mb-6">
                  {isAuthenticated 
                    ? 'Wählen Sie aus der Liste links eine Gruppe aus, um Beiträge zu sehen und sich an Diskussionen zu beteiligen.'
                    : 'Wählen Sie eine Gruppe aus, um anonyme Beiträge von anderen Bewerbenden zu lesen.'
                  }
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  {forumGroups.slice(0, 3).map((group) => (
                    <button
                      key={group.id}
                      onClick={() => setSelectedGroup(group.id)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-namuh-teal hover:bg-namuh-teal/5 transition-colors"
                    >
                      <Hash className="h-8 w-8 text-namuh-teal mx-auto mb-2" />
                      <h4 className="font-medium text-namuh-navy mb-1">{group.name}</h4>
                      <p className="text-sm text-gray-500 line-clamp-2">{group.description}</p>
                      {!isAuthenticated && (
                        <div className="mt-2 flex items-center justify-center text-xs text-gray-400">
                          <Eye className="h-3 w-3 mr-1" />
                          Nur lesen
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Main CTA for non-authenticated users */}
                {!isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 bg-gradient-to-r from-namuh-teal/10 to-namuh-navy/10 rounded-lg border border-namuh-teal/20"
                  >
                    <h4 className="text-lg font-semibold text-namuh-navy mb-3">
                      Registrieren Sie sich für vollständigen Zugang
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Schreiben Sie eigene Beiträge, kommentieren Sie und nutzen Sie alle Community-Features.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link to="/register" className="btn-primary">
                        Kostenlos registrieren
                      </Link>
                      <Link to="/login" className="btn-outline">
                        Anmelden
                      </Link>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};