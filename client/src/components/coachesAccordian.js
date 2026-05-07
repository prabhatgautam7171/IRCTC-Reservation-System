import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setCoaches } from "@/redux/trainSlice";
import SeatMapDemo from "./seatMapDemo";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Save,
  X,
  Train,
  IndianRupee,
  Users,
  Ticket,
  DoorOpen,
  Luggage,
  Wifi,
  Snowflake
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const CoachList = ({ id, train }) => {
  const dispatch = useDispatch();
  const { coaches } = useSelector((state) => state.trains);

  const [expandedType, setExpandedType] = useState(null);
  const [coachId, setCoachId] = useState(null);
  const [newCoachType, setNewCoachType] = useState("");
  const [pricePerSeat, setPricePerSeat] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [coachToDelete, setCoachToDelete] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (train?.coaches) dispatch(setCoaches(train.coaches));
  }, [train, dispatch]);

  const coachTypeDetails = {
    AC: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Snowflake, features: ["AC", "Comfort", "Charging"] },
    Sleeper: { color: "bg-green-100 text-green-800 border-green-200", icon: Users, features: ["Economy", "Spacious"] },
    EC: { color: "bg-purple-100 text-purple-800 border-purple-200", icon: Wifi, features: ["Executive", "WiFi", "Priority"] },
    CC: { color: "bg-amber-100 text-amber-800 border-amber-200", icon: Luggage, features: ["Comfort", "Luggage Space"] },
    General: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: DoorOpen, features: ["Economy", "Accessible"] }
  };

  const handleUpdateCoachType = async () => {
    if (!newCoachType.trim()) {
      toast.error("Coach type is required");
      return;
    }
    
    if (!pricePerSeat || pricePerSeat <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setIsUpdating(true);
    
    try {
      const res = await axios.put(
        `http://localhost:8000/api/v1/train/update-coach/${id}/${coachId}`,
        { coachType: newCoachType, pricePerSeat: Number(pricePerSeat) },
        { withCredentials: true }
      );
      
      if (res.data.success) {
        alert(res.data.message);
        toast.success("Coach updated successfully");
        setCoachId(null);
        setNewCoachType("");
        setPricePerSeat("");
        dispatch(setCoaches(res.data.coaches));
      }
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(error.response?.data?.message || "Failed to update coach");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setCoachId(null);
    setNewCoachType("");
    setPricePerSeat("");
  };

  const handleCoachDelete = async () => {
    try {
      const res = await axios.delete(
        `http://localhost:8000/api/v1/train/remove-coach/${id}/${coachToDelete}`,
        { withCredentials: true }
      );
      
      if (res.data.success) {
        toast.success("Coach deleted successfully");
        dispatch(setCoaches(coaches.filter((c) => c._id !== coachToDelete)));
        setDeleteDialogOpen(false);
        setCoachToDelete(null);
      }
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(error.response?.data?.message || "Failed to delete coach");
    }
  };

  const handleSubCoachDelete = async (coachId, coachNameId) => {
    try {
      const res = await axios.delete(
        `http://localhost:8000/api/v1/train/remove-subcoach/${id}/${coachId}/${coachNameId}`,
        { withCredentials: true }
      );
      
      if (res.data.success) {
        toast.success("Coach unit deleted successfully");
        dispatch(
          setCoaches(
            coaches.map((coach) =>
              coach._id === coachId
                ? {
                    ...coach,
                    coachList: coach.coachList.filter(
                      (sub) => sub._id !== coachNameId
                    ),
                  }
                : coach
            )
          )
        );
      }
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(error.response?.data?.message || "Failed to delete coach unit");
    }
  };

  const openDeleteDialog = (coachId, e) => {
    e.stopPropagation();
    setCoachToDelete(coachId);
    setDeleteDialogOpen(true);
  };

  const getCoachColor = (type) => {
    return coachTypeDetails[type]?.color || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getCoachIcon = (type) => {
    const IconComponent = coachTypeDetails[type]?.icon || Train;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this coach category? This will remove all coach units within this category.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleCoachDelete}>
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {coaches?.filter(Boolean).map((coachGroup, index) => {
        const coachDetails = coachTypeDetails[coachGroup.coachType] || {};
        
        return (
          <Card
            key={coachGroup?._id || `coach-${index}`}
            className="overflow-hidden border-2 transition-all hover:shadow-lg"
          >
            {/* Coach Header - Train Carriage Style */}
            <div
              className={`flex justify-between items-center p-6 cursor-pointer transition-all ${getCoachColor(coachGroup.coachType)} border-b-2`}
              onClick={() =>
                setExpandedType(
                  expandedType === coachGroup?.coachType
                    ? null
                    : coachGroup?.coachType
                )
              }
            >
              <div className="flex items-center gap-4">
                {/* Train Coach Icon */}
                <div className="relative">
                  <div className="w-12 h-12 bg-white rounded-lg border-2 flex items-center justify-center shadow-inner">
                    {getCoachIcon(coachGroup.coachType)}
                  </div>
                  {/* Train coupling indicator */}
                  <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-6 bg-gray-400 rounded-full"></div>
                  <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-6 bg-gray-400 rounded-full"></div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold">
                    {coachGroup?.coachType} Class
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 font-semibold">
                      <IndianRupee className="w-4 h-4" />
                      {coachGroup?.pricePerSeat?.toLocaleString()}
                    </div>
                    <span className="text-sm">per seat</span>
                  </div>
                  
                  {/* Features badges */}
                  <div className="flex gap-1 mt-2">
                    {coachDetails.features?.map((feature, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {expandedType === coachGroup?.coachType ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </span>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1 border-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCoachId(coachGroup?._id);
                    setNewCoachType(coachGroup?.coachType);
                    setPricePerSeat(coachGroup?.pricePerSeat);
                  }}
                >
                  <Edit className="w-3 h-3" /> Edit
                </Button>
                
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 gap-1 border-2"
                  onClick={(e) => openDeleteDialog(coachGroup?._id, e)}
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </Button>
              </div>
            </div>

            {/* Update Form */}
            {coachId === coachGroup?._id && (
              <div className="p-6 border-t bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-2">
                    <Label htmlFor="coach-type" className="font-medium">Coach Type</Label>
                    <Input
                      id="coach-type"
                      value={newCoachType}
                      onChange={(e) => setNewCoachType(e.target.value)}
                      placeholder="e.g., AC, Sleeper"
                      className="border-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price" className="font-medium">Price Per Seat (₹)</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                      <Input
                        id="price"
                        type="number"
                        value={pricePerSeat}
                        onChange={(e) => setPricePerSeat(e.target.value)}
                        placeholder="Price per seat"
                        className="pl-10 border-2"
                        min="1"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleUpdateCoachType} 
                      disabled={isUpdating}
                      className="gap-1 flex-1 border-2"
                    >
                      {isUpdating ? (
                        <>
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" /> Save
                        </>
                      )}
                    </Button>
                    
                    <Button variant="outline" onClick={handleCancel} className="border-2">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Sub Coaches - Individual Coach Units */}
            {expandedType === coachGroup?.coachType && (
              <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                <h4 className="text-lg font-bold mb-6 flex items-center gap-2 border-b pb-2">
                  <Ticket className="w-5 h-5" /> Coach Units - {coachGroup.coachList?.length || 0} Units
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coachGroup?.coachList?.map((coach, subIndex) => (
                    <Card key={coach?._id || `subcoach-${subIndex}`} className="overflow-hidden border-2 shadow-md hover:shadow-lg transition-all">
                      <CardContent className="p-0">
                        {/* Coach Unit Header */}
                        <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 border-b-2">
                          <div className="flex justify-between items-center">
                            <h5 className="font-bold text-lg flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              Coach {coach?.coachName}
                            </h5>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                              onClick={() =>
                                handleSubCoachDelete(coachGroup?._id, coach?._id)
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Coach Unit Body */}
                        <div className="p-4">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="space-y-1 text-center p-2 bg-blue-50 rounded-lg">
                              <p className="text-sm font-medium flex items-center justify-center gap-1">
                                <Users className="w-4 h-4" /> Total Seats
                              </p>
                              <p className="text-xl font-bold text-blue-700">{coach?.totalSeats}</p>
                            </div>
                            
                            <div className="space-y-1 text-center p-2 bg-green-50 rounded-lg">
                              <p className="text-sm font-medium">Available Seats</p>
                              <p className="text-xl font-bold text-green-700">{coach?.availableSeats}</p>
                            </div>
                          </div>
                          
                          {/* Seat Map */}
                          <div className="mb-4">
                            <SeatMapDemo coach={coach} />
                          </div>
                          
                          {/* Occupancy Indicator */}
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all" 
                              style={{ 
                                width: `${(coach.availableSeats / coach.totalSeats) * 100}%` 
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 text-center">
                            {Math.round((coach.availableSeats / coach.totalSeats) * 100)}% available
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {(!coachGroup?.coachList || coachGroup.coachList.length === 0) && (
                  <div className="text-center py-12 bg-gray-100 rounded-lg border-2 border-dashed">
                    <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2 text-gray-600">No Coach Units</h3>
                    <p className="text-gray-500">
                      Add coach units to this category to manage seating.
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}
      
      {(!coaches || coaches.length === 0) && (
        <Card className="text-center py-16 border-2 border-dashed bg-gradient-to-br from-gray-50 to-gray-100">
          <CardContent>
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
              <Train className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-700">No Coach Categories Added</h3>
            <p className="text-gray-600 mb-6">
              Create coach categories to organize your train seating.
            </p>
            <Button className="gap-2">
              <Train className="w-4 h-4" /> Add First Coach Category
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CoachList;