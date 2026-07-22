import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { Button, Card, Chip, List, TextInput } from "react-native-paper";

import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { financialService } from "@/modules/financial/service";
import type { Donation } from "@/types";

const DONATION_CATEGORIES = ["Zakat", "Fitrana", "Nafal", "Other"];

function getMonthLabel(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, { month: "long", year: "numeric" });
}

export default function DonationsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [donors, setDonors] = useState<any[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [month, setMonth] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    financialService.getDonations().then(setDonations);
    financialService.getDonors().then(setDonors);
  }, []);

  const handleSave = async () => {
    if (!selectedDonor || !amount || !category || !month) {
      Alert.alert(
        t("common.error"),
        !selectedDonor
          ? t("financial.donorRequired")
          : !amount
            ? t("financial.amountRequired")
            : !category
              ? t("financial.categoryRequired")
              : t("financial.monthRequired"),
      );
      return;
    }

    const donation = await financialService.recordDonation({
      donorId: selectedDonor,
      amount: Number(amount),
      category,
      month,
      date: new Date().toISOString(),
      note: note || undefined,
    });
    setDonations((prev) => [donation, ...prev]);
    setSelectedDonor(null);
    setAmount("");
    setCategory("");
    setMonth("");
    setNote("");
  };

  return (
    <ScreenWrapper
      title={t("financial.donations")}
      action={
        <Button
          mode="text"
          onPress={() => router.push("/(app)/financial" as never)}
        >
          {t("common.back")}
        </Button>
      }
    >
      <Card mode="elevated" style={styles.card}>
        <Card.Content>
          <TextInput
            label={t("financial.donorName")}
            value={
              selectedDonor
                ? (donors.find((d) => d.id === selectedDonor)?.name ?? "")
                : ""
            }
            disabled
            style={styles.input}
          />
          <FlatList
            data={donors}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <List.Item
                title={item.name}
                description={item.category}
                onPress={() => setSelectedDonor(item.id)}
                titleStyle={
                  selectedDonor === item.id ? styles.selected : undefined
                }
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
          />
          <TextInput
            label={t("financial.amountRequired")}
            value={amount}
            onChangeText={setAmount}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label={t("financial.month")}
            value={month}
            onChangeText={setMonth}
            mode="outlined"
            style={styles.input}
          />
          <View style={styles.categoryRow}>
            {DONATION_CATEGORIES.map((option) => (
              <Chip
                key={option}
                mode={category === option ? "flat" : "outlined"}
                onPress={() => setCategory(option)}
                style={styles.categoryChip}
              >
                {option}
              </Chip>
            ))}
          </View>
          <TextInput
            label={t("financial.note")}
            value={note}
            onChangeText={setNote}
            mode="outlined"
            multiline
            style={styles.input}
          />
          <Button mode="contained" onPress={handleSave} style={styles.button}>
            {t("common.save")}
          </Button>
        </Card.Content>
      </Card>
      <FlatList
        data={donations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const donorName = donors.find(
            (donor) => donor.id === item.donorId,
          )?.name;
          return (
            <List.Item
              title={`${donorName ?? "Unknown Donor"} • ${item.amount}`}
              description={`${item.category} • ${item.month ?? getMonthLabel(item.date)} • ${item.note ?? t("common.noData")}`}
            />
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  input: { marginTop: 12 },
  button: { marginTop: 12 },
  divider: { height: 1, backgroundColor: "#E0E0E0" },
  selected: { fontWeight: "700" },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  categoryChip: {
    marginBottom: 8,
  },
});
