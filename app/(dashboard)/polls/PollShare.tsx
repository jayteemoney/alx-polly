"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copy, Share2, Twitter, Facebook, Mail, QrCode } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode.react";

/**
 * Props for the PollShare component.
 */
interface PollShareProps {
  pollId: string;
  pollTitle: string;
}

/**
 * A client-side component that provides multiple ways to share a poll.
 * It generates a shareable link and provides buttons for copying the link,
 * sharing on social media, and displaying a QR code.
 * @param {PollShareProps} props - The props for the component, including the poll ID and title.
 */
export default function PollShare({ pollId, pollTitle }: PollShareProps) {
  // State for the shareable URL and QR code visibility
  const [shareUrl, setShareUrl] = useState("");
  const [showQr, setShowQr] = useState(false);

  // Effect to generate the shareable URL once the component mounts
  useEffect(() => {
    const baseUrl = window.location.origin;
    const pollUrl = `${baseUrl}/polls/${pollId}`;
    setShareUrl(pollUrl);
  }, [pollId]);

  /**
   * Copies the shareable URL to the clipboard and shows a success toast.
   */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  /**
   * Opens a new window to share the poll on Twitter.
   */
  const shareOnTwitter = () => {
    const text = encodeURIComponent(`Check out this poll: ${pollTitle}`);
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank"
    );
  };

  /**
   * Opens a new window to share the poll on Facebook.
   */
  const shareOnFacebook = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank"
    );
  };

  /**
   * Opens the user's default email client to share the poll.
   */
  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Poll: ${pollTitle}`);
    const body = encodeURIComponent(
      `Hi! I'd like to share this poll with you: ${shareUrl}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share This Poll
        </CardTitle>
        <CardDescription>
          Share your poll with others to gather votes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Shareable Link
          </label>
          <div className="flex space-x-2">
            <Input
              value={shareUrl}
              readOnly
              className="font-mono text-sm"
              placeholder="Generating link..."
            />
            <Button onClick={copyToClipboard} variant="outline" size="sm">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Share on social media
          </label>
          <div className="flex space-x-2">
            {/* Social sharing buttons */}
            <Button
              onClick={shareOnTwitter}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </Button>
            <Button
              onClick={shareOnFacebook}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </Button>
            <Button
              onClick={shareViaEmail}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
            {/* QR Code toggle button */}
            <Button
              onClick={() => setShowQr(!showQr)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <QrCode className="h-4 w-4" />
              {showQr ? "Hide QR" : "Show QR"}
            </Button>
          </div>
        </div>
        {/* Conditionally render the QR code */}
        {showQr && (
          <div className="flex justify-center p-4">
            <QRCode value={shareUrl} size={128} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}