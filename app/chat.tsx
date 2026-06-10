import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useRef } from 'react';
import { Colors } from '../constants/colors';

const quickReplies = [
  '✨ Looks great!',
  '🎨 Change color?',
  '📅 Book now',
];

export default function ChatScreen() {
  const router = useRouter();
  const { name, emoji, specialty, area } = useLocalSearchParams<{
    name: string;
    emoji: string;
    specialty: string;
    area: string;
  }>();

  const decoratorName = name || 'Kofi Decor';
  const decoratorEmoji = emoji || '👨🏿';
  const decoratorSpecialty = specialty || 'Interior Designer';
  const decoratorArea = area || 'Accra, Ghana';

  const [messages, setMessages] = useState([
    {
      id: 1,
      me: true,
      text: `Hi ${decoratorName}! I'm looking for a modern design for my space. Can you help me?`,
      time: '10:42 AM',
      hasPreview: false,
      hasBookingSummary: false,
    },
    {
      id: 2,
      me: false,
      text: "Absolutely! I've generated this AI preview for you. It features minimalist furniture with Kente accents and Adinkra wall art.",
      time: '10:45 AM',
      hasPreview: true,
      hasBookingSummary: false,
    },
    {
      id: 3,
      me: true,
      text: 'This is exactly what I was imagining! How much would this setup cost?',
      time: '10:47 AM',
      hasPreview: false,
      hasBookingSummary: false,
    },
    {
      id: 4,
      me: false,
      text: '',
      time: '10:48 AM',
      hasPreview: false,
      hasBookingSummary: true,
    },
  ]);

  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: messages.length + 1,
      me: true,
      text: input,
      time: 'Now',
      hasPreview: false,
      hasBookingSummary: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          me: false,
          text: 'Got it! I will prepare a full quote and send it to you by end of day. Is the venue confirmed?',
          time: 'Now',
          hasPreview: false,
          hasBookingSummary: false,
        },
      ]);
    }, 1200);

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleQuickReply = (reply: string) => {
    setInput(reply);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarEmoji}>{decoratorEmoji}</Text>
            </View>
            <View>
              <Text style={styles.headerName}>{decoratorName}</Text>
              <View style={styles.onlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>
                  Online • {decoratorSpecialty}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionBtn}>
              <Text style={styles.headerActionIcon}>📞</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionBtn}>
              <Text style={styles.headerActionIcon}>⋮</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date separator */}
        <View style={styles.dateSeparator}>
          <View style={styles.dateLine} />
          <Text style={styles.dateText}>TODAY</Text>
          <View style={styles.dateLine} />
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((msg) => (
            <View key={msg.id}>
              {/* Regular message */}
              {!msg.hasPreview && !msg.hasBookingSummary && (
                <View style={[
                  styles.messageRow,
                  msg.me ? styles.messageRowMe : styles.messageRowThem,
                ]}>
                  {!msg.me && (
                    <View style={styles.msgAvatar}>
                      <Text style={styles.msgAvatarEmoji}>
                        {decoratorEmoji}
                      </Text>
                    </View>
                  )}
                  <View style={[
                    styles.bubble,
                    msg.me ? styles.bubbleMe : styles.bubbleThem,
                  ]}>
                    <Text style={[
                      styles.bubbleText,
                      msg.me ? styles.bubbleTextMe : styles.bubbleTextThem,
                    ]}>
                      {msg.text}
                    </Text>
                    <Text style={[
                      styles.bubbleTime,
                      msg.me ? styles.bubbleTimeMe : styles.bubbleTimeThem,
                    ]}>
                      {msg.time}
                    </Text>
                  </View>
                </View>
              )}

              {/* AI Preview message */}
              {msg.hasPreview && (
                <View style={styles.messageRow}>
                  <View style={styles.msgAvatar}>
                    <Text style={styles.msgAvatarEmoji}>{decoratorEmoji}</Text>
                  </View>
                  <View style={styles.previewCard}>
                    <Text style={styles.bubbleTextThem}>{msg.text}</Text>
                    <View style={styles.previewImageArea}>
                      <View style={styles.previewBadge}>
                        <Text style={styles.previewBadgeText}>
                          AI GENERATED PREVIEW
                        </Text>
                      </View>
                      <View style={styles.previewImage}>
                        <Text style={styles.previewEmoji}>🏠</Text>
                        <Text style={styles.previewLabel}>
                          Modern Living Room with Kente Accents
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.bubbleTimeThem}>{msg.time}</Text>
                  </View>
                </View>
              )}

              {/* Booking Summary */}
              {msg.hasBookingSummary && (
                <View style={styles.messageRow}>
                  <View style={styles.msgAvatar}>
                    <Text style={styles.msgAvatarEmoji}>{decoratorEmoji}</Text>
                  </View>
                  <View style={styles.bookingSummaryCard}>
                    <Text style={styles.bookingSummaryTitle}>
                      Booking Summary
                    </Text>
                    <View style={styles.bookingSummaryRow}>
                      <Text style={styles.bookingSummaryLabel}>Service</Text>
                      <Text style={styles.bookingSummaryValue}>
                        Modern Living Room Decor
                      </Text>
                    </View>
                    <View style={styles.bookingSummaryRow}>
                      <Text style={styles.bookingSummaryLabel}>
                        Scheduled Date
                      </Text>
                      <Text style={styles.bookingSummaryValue}>
                        Oct 12, 2024
                      </Text>
                    </View>
                    <View style={styles.bookingSummaryRow}>
                      <Text style={styles.bookingSummaryLabel}>
                        Estimated Price
                      </Text>
                      <Text style={styles.bookingSummaryPrice}>
                        GH₵ 2,500
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.confirmBtn}
                      onPress={() => router.push('/bookings')}
                    >
                      <Text style={styles.confirmBtnText}>
                        Review & Confirm
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Quick replies */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickRepliesRow}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {quickReplies.map((reply) => (
            <TouchableOpacity
              key={reply}
              style={styles.quickReplyChip}
              onPress={() => handleQuickReply(reply)}
            >
              <Text style={styles.quickReplyText}>{reply}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn}>
            <Text style={styles.attachIcon}>📎</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.inputField}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textLight}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              !input.trim() && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Text style={styles.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 18,
    color: Colors.text,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.green100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  headerAvatarEmoji: {
    fontSize: 20,
  },
  headerName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  onlineText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionIcon: {
    fontSize: 18,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textLight,
    letterSpacing: 0.5,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
    gap: 8,
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowThem: {
    justifyContent: 'flex-start',
  },
  msgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.green100,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  msgAvatarEmoji: {
    fontSize: 16,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    padding: 12,
    gap: 4,
  },
  bubbleMe: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextMe: {
    color: Colors.white,
  },
  bubbleTextThem: {
    color: Colors.text,
  },
  bubbleTime: {
    fontSize: 11,
  },
  bubbleTimeMe: {
    color: Colors.white + '99',
    textAlign: 'right',
  },
  bubbleTimeThem: {
    color: Colors.textLight,
  },
  previewCard: {
    maxWidth: '80%',
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  previewImageArea: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  previewBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 1,
    backgroundColor: Colors.accent,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  previewBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  previewImage: {
    height: 160,
    backgroundColor: Colors.green100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 8,
  },
  previewEmoji: {
    fontSize: 48,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  bookingSummaryCard: {
    maxWidth: '80%',
    backgroundColor: Colors.primary,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 16,
    gap: 10,
  },
  bookingSummaryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 4,
  },
  bookingSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  bookingSummaryLabel: {
    fontSize: 12,
    color: Colors.green200,
  },
  bookingSummaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'right',
    flex: 1,
  },
  bookingSummaryPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.accent,
  },
  confirmBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  quickRepliesRow: {
    maxHeight: 48,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: 8,
  },
  quickReplyChip: {
    backgroundColor: Colors.bg,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickReplyText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  attachIcon: {
    fontSize: 18,
  },
  inputField: {
    flex: 1,
    backgroundColor: Colors.bg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  sendBtnText: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '700',
  },
});