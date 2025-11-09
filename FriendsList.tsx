import { useState, useEffect } from 'react';
import { Friend, FriendRequest } from '../types/game';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { UserPlus, Users, Mail, Search, Trash2, Send } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface FriendsListProps {
  friends: Friend[];
  friendRequests: FriendRequest[];
  onClose: () => void;
  onSearchUsers: (searchTerm: string) => Promise<any[]>;
  onSendFriendRequest: (userId: string) => Promise<void>;
  onAcceptRequest: (requestId: string, friendId: string) => Promise<void>;
  onRejectRequest: (requestId: string) => Promise<void>;
  onRemoveFriend: (friendId: string) => Promise<void>;
  onInviteToSession: (friendId: string) => void;
  currentSessionId?: string;
}

export function FriendsList({
  friends,
  friendRequests,
  onClose,
  onSearchUsers,
  onSendFriendRequest,
  onAcceptRequest,
  onRejectRequest,
  onRemoveFriend,
  onInviteToSession,
  currentSessionId
}: FriendsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (searchTerm.length < 2) {
      toast.error('Search term must be at least 2 characters');
      return;
    }

    setSearching(true);
    try {
      const results = await onSearchUsers(searchTerm);
      setSearchResults(results);
    } catch (error) {
      toast.error('Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await onSendFriendRequest(userId);
      toast.success('Friend request sent!');
      setSearchResults([]);
      setSearchTerm('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send friend request');
    }
  };

  const handleAccept = async (request: FriendRequest) => {
    try {
      await onAcceptRequest(request.id, request.fromUserId);
      toast.success(`You are now friends with ${request.fromUsername}!`);
    } catch (error) {
      toast.error('Failed to accept friend request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await onRejectRequest(requestId);
      toast.success('Friend request rejected');
    } catch (error) {
      toast.error('Failed to reject friend request');
    }
  };

  const handleRemove = async (friendId: string, friendName: string) => {
    if (confirm(`Remove ${friendName} from friends?`)) {
      try {
        await onRemoveFriend(friendId);
        toast.success('Friend removed');
      } catch (error) {
        toast.error('Failed to remove friend');
      }
    }
  };

  const handleInvite = (friendId: string, friendName: string) => {
    onInviteToSession(friendId);
    toast.success(`Invited ${friendName} to your game!`);
  };

  return (
    <div 
      className="min-h-screen p-8"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl text-white mb-2">👥 Friends</h1>
            <p className="text-white/80">{friends.length} friends</p>
          </div>
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div>

        <Tabs defaultValue="friends" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends">
              <Users className="size-4 mr-2" />
              Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="requests">
              <Mail className="size-4 mr-2" />
              Requests ({friendRequests.length})
            </TabsTrigger>
            <TabsTrigger value="add">
              <UserPlus className="size-4 mr-2" />
              Add Friend
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends">
            <Card className="p-4">
              <ScrollArea className="h-[500px]">
                {friends.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="size-12 mx-auto mb-4 opacity-50" />
                    <p>No friends yet. Add some friends to play together!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {friends.map(friend => (
                      <Card key={friend.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">👤</div>
                            <div>
                              <p>{friend.username}</p>
                              <Badge 
                                variant={friend.status === 'online' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {friend.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {currentSessionId && friend.status === 'online' && (
                              <Button
                                size="sm"
                                onClick={() => handleInvite(friend.id, friend.username)}
                              >
                                <Send className="size-4 mr-2" />
                                Invite
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemove(friend.id, friend.username)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card className="p-4">
              <ScrollArea className="h-[500px]">
                {friendRequests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Mail className="size-12 mx-auto mb-4 opacity-50" />
                    <p>No pending friend requests</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {friendRequests.map(request => (
                      <Card key={request.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">👤</div>
                            <div>
                              <p>{request.fromUsername}</p>
                              <p className="text-sm text-muted-foreground">
                                wants to be your friend
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAccept(request)}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(request.id)}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="add">
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={searching}>
                    <Search className="size-4 mr-2" />
                    {searching ? 'Searching...' : 'Search'}
                  </Button>
                </div>

                <ScrollArea className="h-[450px]">
                  {searchResults.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Search className="size-12 mx-auto mb-4 opacity-50" />
                      <p>Search for users by username</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {searchResults.map(user => (
                        <Card key={user.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">👤</div>
                              <p>{user.username}</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleSendRequest(user.id)}
                            >
                              <UserPlus className="size-4 mr-2" />
                              Add Friend
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
