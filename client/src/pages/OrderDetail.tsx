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
import { Loader2, ArrowLeft, Download, Send } from "lucide-react";
import { toast } from "sonner";

export default function OrderDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const orderId = Number(params.id);

  const [messageContent, setMessageContent] = useState("");

  const { data, isLoading, refetch } = trpc.orders.getById.useQuery({ id: orderId });
  const sendMessageMutation = trpc.messages.send.useMutation({
    onSuccess: () => {
      toast.success(t("common.success"));
      setMessageContent("");
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
    if (!messageContent.trim() || !data?.order?.designerId) return;

    sendMessageMutation.mutate({
      orderId,
      receiverId: data.order.designerId,
      content: messageContent,
    });
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
          onClick={() => setLocation("/client/dashboard")}
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
            </CardContent>
          </Card>

          {/* Uploaded Files */}
          {files && files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Files</CardTitle>
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

          {/* Deliverables */}
          {deliverables && deliverables.length > 0 && (
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="text-primary">Final Deliverables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {deliverables.map((deliverable) => (
                    <div
                      key={deliverable.id}
                      className="flex items-center justify-between p-3 bg-primary/10 rounded-lg"
                    >
                      <span className="text-sm font-medium">{deliverable.fileName}</span>
                      <Button variant="default" size="sm" asChild>
                        <a href={deliverable.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Messages */}
          {order.designerId && (
            <Card>
              <CardHeader>
                <CardTitle>Messages with Designer</CardTitle>
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
          )}
        </div>
      </div>
    </div>
  );
}
