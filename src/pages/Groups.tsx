import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye, UserPlus, UserMinus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { communityService, type CommunityChannel } from "@/lib/services/community";
import { useUser } from "@/lib/hooks/use-user";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export const Groups = () => {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
  const [channels, setChannels] = useState<CommunityChannel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentChannel, setCurrentChannel] = useState<CommunityChannel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newChannel, setNewChannel] = useState({
    name: "",
    description: "",
    logo_url: "",
  });
  
  const { toast } = useToast();
  const { user } = useUser();

  useEffect(() => {
    loadChannels();
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data: users } = await communityService.getUsers();
      setUsers(users);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    }
  };

  const loadChannels = async () => {
    try {
      const data = await communityService.getChannels();
      setChannels(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load community channels",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateChannel = async () => {
    if (!user) return;
    if (!newChannel.name || !newChannel.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const channel = await communityService.createChannel({
        name: newChannel.name,
        description: newChannel.description,
        logo_url: newChannel.logo_url || undefined,
      });
      
      await communityService.addChannelMember({
        channel_id: channel.id,
        user_id: user.id,
      });
      
      toast({
        title: "Success",
        description: "Community channel created successfully",
      });
      
      setIsCreateOpen(false);
      setNewChannel({ name: "", description: "", logo_url: "" });
      loadChannels();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create community channel",
        variant: "destructive",
      });
    }
  };

  const handleAddMembers = async () => {
    if (!currentChannel || selectedUsers.length === 0) return;

    try {
      await Promise.all(
        selectedUsers.map((userId) =>
          communityService.addChannelMember({
            channel_id: currentChannel.id,
            user_id: userId,
          })
        )
      );

      toast({
        title: "Success",
        description: `Added ${selectedUsers.length} members to ${currentChannel.name}`,
      });

      // Refresh channel details to show new members
      const updatedChannel = await communityService.getChannelById(currentChannel.id);
      setCurrentChannel(updatedChannel);
      setSelectedUsers([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add members",
        variant: "destructive",
      });
    }
  };

  const handleView = async (channel: CommunityChannel) => {
    try {
      const channelDetails = await communityService.getChannelById(channel.id);
      setCurrentChannel(channelDetails);
      setIsAddMembersOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load channel details",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (channel: CommunityChannel) => {
    setCurrentChannel(channel);
    setNewChannel({
      name: channel.name,
      description: channel.description,
      logo_url: channel.logo_url || "",
    });
    setIsCreateOpen(true);
  };

  const handleDelete = async (channel: CommunityChannel) => {
    try {
      await communityService.deleteChannel(channel.id);
      toast({
        title: "Success",
        description: `Deleted ${channel.name}`,
      });
      loadChannels();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete channel",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (channelId: string, userId: string) => {
    try {
      await communityService.removeChannelMember(channelId, userId);
      toast({
        title: "Success",
        description: "Member removed successfully",
      });
      if (currentChannel) {
        const updatedChannel = await communityService.getChannelById(channelId);
        setCurrentChannel(updatedChannel);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Community Channels</h1>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    <Plus className="h-5 w-5 mr-2" />
                    CREATE NEW CHANNEL
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {currentChannel ? "Edit Channel" : "Create New Channel"}
                    </DialogTitle>
                    <DialogDescription>
                      {currentChannel ? "Update the channel details below." : "Enter the details to create a new community channel."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Channel Name</Label>
                      <Input
                        id="name"
                        value={newChannel.name}
                        onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                        placeholder="Enter channel name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newChannel.description}
                        onChange={(e) => setNewChannel({ ...newChannel, description: e.target.value })}
                        placeholder="Enter channel description"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="logo_url">Logo URL (Optional)</Label>
                      <Input
                        id="logo_url"
                        value={newChannel.logo_url}
                        onChange={(e) => setNewChannel({ ...newChannel, logo_url: e.target.value })}
                        placeholder="Enter logo URL"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={currentChannel ? () => handleUpdateChannel() : handleCreateChannel}>
                      {currentChannel ? "Update" : "Create"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mb-6">
              <SearchBar
                placeholder="Search channels..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Channel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Members
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredChannels.length > 0 ? (
                    filteredChannels.map((channel) => (
                      <tr key={channel.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {channel.logo_url ? (
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={channel.logo_url}
                                  alt={channel.name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-500 font-medium">
                                    {channel.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {channel.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {channel.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {channel.member_count?.count || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(channel.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(channel)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(channel)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(channel)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No channels found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Add Members Dialog */}
      <Dialog open={isAddMembersOpen} onOpenChange={setIsAddMembersOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentChannel?.name} - Members
            </DialogTitle>
            <DialogDescription>
              Manage members of this channel
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Current Members</h3>
              <ScrollArea className="h-[200px] border rounded-md p-2">
                {currentChannel?.members && currentChannel.members.length > 0 ? (
                  <div className="space-y-2">
                    {currentChannel.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {member.user.full_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{member.user.full_name}</p>
                            <p className="text-xs text-gray-500">{member.user.email}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(currentChannel.id, member.user.id)}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-gray-500">No members yet</p>
                  </div>
                )}
              </ScrollArea>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Add Members</h3>
              <ScrollArea className="h-[200px] border rounded-md p-2">
                <div className="space-y-2">
                  {users
                    .filter(
                      (u) =>
                        !currentChannel?.members?.some(
                          (m) => m.user.id === u.id
                        )
                    )
                    .map((user) => (
                      <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md">
                        <Checkbox
                          id={`user-${user.id}`}
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(
                                selectedUsers.filter((id) => id !== user.id)
                              );
                            }
                          }}
                        />
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {user.full_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Label
                              htmlFor={`user-${user.id}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {user.full_name}
                            </Label>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleAddMembers} disabled={selectedUsers.length === 0}>
              Add Selected Members
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Add the missing handleUpdateChannel function
const handleUpdateChannel = async () => {
  if (!currentChannel) return;
  
  try {
    await communityService.updateChannel(currentChannel.id, {
      name: newChannel.name,
      description: newChannel.description,
      logo_url: newChannel.logo_url || undefined,
    });
    
    toast({
      title: "Success",
      description: "Channel updated successfully",
    });
    
    setIsCreateOpen(false);
    loadChannels();
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to update channel",
      variant: "destructive",
    });
  }
}; 