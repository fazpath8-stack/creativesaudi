import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Upload, X, ArrowLeft } from "lucide-react";

export default function ServiceDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const serviceId = Number(params.id);

  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<{ name: string; data: string; type: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  const { data: service, isLoading } = trpc.services.getById.useQuery({ id: serviceId });

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: async (data) => {
      // Upload files if any
      if (files.length > 0 && data.orderId) {
        setUploading(true);
        try {
          for (const file of files) {
            await uploadFileMutation.mutateAsync({
              orderId: data.orderId,
              fileName: file.name,
              fileData: file.data,
              fileType: file.type,
            });
          }
        } catch (error) {
          console.error("File upload error:", error);
        }
        setUploading(false);
      }

      toast.success(t("common.success"));
      setLocation(`/client/order/${data.orderId}`);
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const uploadFileMutation = trpc.orders.uploadFile.useMutation();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const reader = new FileReader();

      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const base64Data = base64.split(",")[1]; // Remove data:image/png;base64, prefix

        setFiles((prev) => [
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
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error("Please enter order description");
      return;
    }

    createOrderMutation.mutate({
      serviceId,
      description,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Service not found</p>
      </div>
    );
  }

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

        <div className="grid md:grid-cols-2 gap-8">
          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {language === "ar" ? service.nameAr : service.name}
              </CardTitle>
              <CardDescription>
                {language === "ar" ? service.descriptionAr : service.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("services.price")}</p>
                  <p className="text-3xl font-bold text-primary">
                    {(service.price / 100).toFixed(0)} {t("services.sar")}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">{t("payment.simulation")}</p>
                  <p className="text-xs text-muted-foreground">
                    This is a demonstration platform. No real payment will be processed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Form */}
          <Card>
            <CardHeader>
              <CardTitle>{t("orders.create")}</CardTitle>
              <CardDescription>Describe your requirements and upload any reference files</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">{t("orders.description")}</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your project requirements in detail..."
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("orders.uploadFiles")}</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    <Input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload files (images, documents, etc.)
                      </span>
                    </label>
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {files.map((file, index) => (
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
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createOrderMutation.isPending || uploading}
                >
                  {(createOrderMutation.isPending || uploading) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("orders.submit")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
