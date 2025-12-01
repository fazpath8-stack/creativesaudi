import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Download, Send, Upload, X } from "lucide-react";
import { toast } from "sonner";

export default function DesignerOrderDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const orderId = Number(params.id);

  const [messageContent, setMessageContent] = useState("");
  const [deliverableFiles, setDeliverableFiles] = useState<{ name: string; data: string; type: string }[]>([]);

  const { data, isLoading, refetch } = trpc.orders.getById.useQuery({ id: orderId });
  
  const sendMessageMutation = trpc.messages.send.useMutation({
    onSuccess: () => {
      toast.success(t("common.success"));
      setMessageContent("");
      refetch();
    },
  });

  const uploadDeliverableMutation = trpc.orders.uploadDeliverable.useMutation({
    onSuccess: () => {
      toast.success("Deliverable uploaded successfully!");
      setDeliverableFiles([]);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success(t("common.success"));
      refetch();
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      assigned: "secondary",
      in_progress: "default",
      completed: "default",
      cancelled: "destructive",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {t(`orders.${status}`)}
      </Badge>
    );
  };

  const handleSendMessage = () => {
    if (!messageContent.trim() || !data?.order?.clientId) return;

    sendMessageMutation.mutate({
      orderId,
      receiverId: data.order.clientId,
      content: messageContent,
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const reader = new FileReader();

      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const base64Data = base64.split(",")[1];

        setDeliverableFiles((prev) => [
          ...prev,
          {
            name: file.name,
            data: base64Data,
            type: file.type,
          },
        ]);
      };

      reader.readAsDataURL(file);
    }
  };

  const removeFile = (index: number) => {
    setDeliverableFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadDeliverable = async () => {
    if (deliverableFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    for (const file of deliverableFiles) {
      await uploadDeliverableMutation.mutateAsync({
        orderId,
        fileName: file.name,
        fileData: file.data,
        fileType: file.type,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || !data.order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Order not found</p>
      </div>
    );
  }

  const { order, files, deliverables, messages } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="container max-w-4xl py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/designer/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("common.back")}
        </Button>

        <div className="space-y-6">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order #{order.id}</CardTitle>
                {getStatusBadge(order.status)}
              </div>
              <CardDescription>
                Created: {new Date(order.createdAt).toLocaleString(language === "ar" ? "ar-SA" : "en-US")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="mt-1">{order.description}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("services.price")}</p>
                <p className="text-2xl font-bold text-primary">
                  {(order.price / 100).toFixed(0)} {t("services.sar")}
                </p>
              </div>
              {order.status === "assigned" && (
                <Button
                  onClick={() =>
                    updateStatusMutation.mutate({ orderId, status: "in_progress" })
                  }
                  disabled={updateStatusMutation.isPending}
                >
                  Start Working
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Client Files */}
          {files && files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Client Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <span className="text-sm">{file.fileName}</span>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Deliverables */}
          {order.status !== "completed" && order.status !== "cancelled" && (
            <Card>
              <CardHeader>
                <CardTitle>{t("designer.uploadResult")}</CardTitle>
                <CardDescription>Upload your final work for the client</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="deliverable-upload"
                  />
                  <label
                    htmlFor="deliverable-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload deliverable files
                    </span>
                  </label>
                </div>

                {deliverableFiles.length > 0 && (
                  <div className="space-y-2">
                    {deliverableFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded"
                      >
                        <span className="text-sm truncate">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      onClick={handleUploadDeliverable}
                      disabled={uploadDeliverableMutation.isPending}
                      className="w-full"
                    >
                      {uploadDeliverableMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Upload & Complete Order
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Deliverables */}
          {deliverables && deliverables.length > 0 && (
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="text-primary">Uploaded Deliverables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {deliverables.map((deliverable) => (
                    <div
                      key={deliverable.id}
                      className="flex items-center justify-between p-3 bg-primary/10 rounded-lg"
                    >
                      <span className="text-sm font-medium">{deliverable.fileName}</span>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={deliverable.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Messages with Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {messages && messages.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.senderId === user?.id
                          ? "bg-primary/20 ml-8"
                          : "bg-muted mr-8"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(message.createdAt).toLocaleString(language === "ar" ? "ar-SA" : "en-US")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No messages yet</p>
              )}

              <Separator />

              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageContent.trim() || sendMessageMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
