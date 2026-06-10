import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';

const bookings = [
  {
    id: 'BK-7294-GH',
    design: 'Ghanaian Heritage Fusion',
    type: 'Modern Living Room',
    decorator: 'Kofi Decor',
    date: 'Oct 12, 2024',
    status: 'CONFIRMED',
    statusColor: Colors.accent,
    statusTextColor: Colors.primary,
    currentStep: 2,
    emoji: '🏠',
    bg: '#E8F5E9',
    steps: [
      {
        label: 'Enquiry Sent',
        time: 'Sept 28, 10:45 AM',
        done: true,
      },
      {
        label: 'Booking Confirmed',
        time: 'Sept 30, 02:15 PM',
        done: true,
      },
      {
        label: 'In Preparation',
        time: 'Kofi is sourcing Kente materials & motifs.',
        done: false,
        active: true,
      },
      {
        label: 'Service Completed',
        time: 'Pending execution on site',
        done: false,
      },
    ],
  },
  {
    id: 'BK-6103-GH',
    design: 'Modern Royal Wedding',
    type: 'Wedding Reception',
    decorator: 'Serwaa Mensah',
    date: 'Nov 5, 2024',
    status: 'IN PROGRESS',
    statusColor: Colors.green100,
    statusTextColor: Colors.primary,
    currentStep: 1,
    emoji: '💍',
    bg: '#FFF9E6',
    steps: [
      {
        label: 'Enquiry Sent',
        time: 'Oct 1, 09:00 AM',
        done: true,
      },
      {
        label: 'Booking Confirmed',
        time: 'Oct 3, 11:30 AM',
        done: false,
        active: true,
      },
      {
        label: 'In Preparation',
        time: 'Pending',
        done: false,
      },
      {
        label: 'Service Completed',
        time: 'Pending',
        done: false,
      },
    ],
  },
];

export default function BookingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {bookings.map((booking) => (
          <View key={booking.id} style={styles.bookingCard}>

            {/* Booking info top */}
            <View style={styles.bookingTop}>
              <View style={[styles.designThumb, { backgroundColor: booking.bg }]}>
                <Text style={styles.designEmoji}>{booking.emoji}</Text>
              </View>
              <View style={styles.bookingInfo}>
                <View style={styles.bookingInfoTop}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: booking.statusColor },
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: booking.statusTextColor },
                    ]}>
                      {booking.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.designName}>{booking.design}</Text>
                <Text style={styles.designType}>{booking.type}</Text>
              </View>
            </View>

            {/* Decorator & date */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>DECORATOR</Text>
                <Text style={styles.metaValue}>{booking.decorator}</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>DATE</Text>
                <Text style={styles.metaValue}>{booking.date}</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Live Status */}
            <Text style={styles.liveStatusTitle}>LIVE STATUS</Text>
            <View style={styles.timeline}>
              {booking.steps.map((step, i) => (
                <View key={i} style={styles.timelineItem}>
                  {/* Line + dot */}
                  <View style={styles.timelineLeft}>
                    <View style={[
                      styles.timelineDot,
                      step.done && styles.timelineDotDone,
                      step.active && styles.timelineDotActive,
                    ]}>
                      {step.done && (
                        <Text style={styles.timelineDotCheck}>✓</Text>
                      )}
                      {step.active && (
                        <View style={styles.timelineDotInner} />
                      )}
                    </View>
                    {i < booking.steps.length - 1 && (
                      <View style={[
                        styles.timelineLine,
                        step.done && styles.timelineLineDone,
                      ]} />
                    )}
                  </View>

                  {/* Content */}
                  <View style={styles.timelineContent}>
                    <Text style={[
                      styles.timelineLabel,
                      !step.done && !step.active && styles.timelineLabelMuted,
                      step.active && styles.timelineLabelActive,
                    ]}>
                      {step.label}
                    </Text>
                    <Text style={[
                      styles.timelineTime,
                      step.active && styles.timelineTimeActive,
                    ]}>
                      {step.time}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Reschedule banner */}
            <TouchableOpacity style={styles.rescheduleBanner}>
              <View style={styles.rescheduleLeft}>
                <View style={styles.rescheduleIcon}>
                  <Text style={styles.rescheduleIconText}>?</Text>
                </View>
                <View>
                  <Text style={styles.rescheduleTitle}>Need to reschedule?</Text>
                  <Text style={styles.rescheduleSubtitle}>
                    Contact us before Oct 10th
                  </Text>
                </View>
              </View>
              <Text style={styles.rescheduleArrow}>›</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Bottom buttons */}
            <View style={styles.bottomBtns}>
              <TouchableOpacity
                style={styles.contactBtn}
                onPress={() => router.push('/chat')}
              >
                <Text style={styles.contactBtnText}>
                  💬 Contact Decorator
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn}>
                <Text style={styles.shareBtnText}>↗</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* New booking button */}
        <TouchableOpacity
          style={styles.newBookingBtn}
          onPress={() => router.push('/decorators')}
        >
          <Text style={styles.newBookingText}>+ Book a New Decorator</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  backArrow: {
    fontSize: 16,
    color: Colors.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  bookingCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  bookingTop: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  designThumb: {
    width: 70,
    height: 70,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  designEmoji: {
    fontSize: 32,
  },
  bookingInfo: {
    flex: 1,
    gap: 4,
  },
  bookingInfoTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  designName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 2,
  },
  designType: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    backgroundColor: Colors.bg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 16,
  },
  metaItem: {
    flex: 1,
    gap: 4,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textLight,
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  metaDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  liveStatusTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  timeline: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 14,
    minHeight: 60,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.bg,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineDotDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timelineDotActive: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  timelineDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  timelineDotCheck: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.white,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  timelineLineDone: {
    backgroundColor: Colors.primary,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
    gap: 4,
  },
  timelineLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  timelineLabelMuted: {
    color: Colors.textLight,
    fontWeight: '500',
  },
  timelineLabelActive: {
    color: Colors.primary,
  },
  timelineTime: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  timelineTimeActive: {
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  rescheduleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bg,
    borderRadius: 12,
    padding: 14,
  },
  rescheduleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rescheduleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rescheduleIconText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  rescheduleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  rescheduleSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  rescheduleArrow: {
    fontSize: 22,
    color: Colors.textLight,
  },
  bottomBtns: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  contactBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  contactBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  shareBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText: {
    fontSize: 18,
    color: Colors.textMuted,
  },
  newBookingBtn: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  newBookingText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
});