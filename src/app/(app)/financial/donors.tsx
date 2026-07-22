import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";

import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { financialService } from "@/modules/financial/service";
import type { Donor } from "@/types";

export default function DonorsScreen() {
  const { t } = useTranslation();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    financialService.getDonors().then(setDonors);
  }, []);

  const handleSave = async () => {
    if (!name || !category) return;
    const donor = await financialService.addDonor({
      name,
      contactNumber,
      category,
    });
    setDonors((prev) => [donor, ...prev]);
    setName("");
    setContactNumber("");
    setCategory("");
  };

  return (
    <ScreenWrapper title={t("financial.donors")}>
      <Card mode="elevated" style={styles.card}>
        <Card.Content>
          <TextInput
            label={t("financial.donorName")}
            value={name}
            onChangeText={setName}
            mode="outlined"
          />
          <TextInput
            label={t("financial.contactNumber")}
            value={contactNumber}
            onChangeText={setContactNumber}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label={t("financial.donorCategory")}
            value={category}
            onChangeText={setCategory}
            mode="outlined"
            style={styles.input}
          />
          <Button mode="contained" onPress={handleSave} style={styles.button}>
            {t("common.save")}
          </Button>
        </Card.Content>
      </Card>

      {donors.map((donor) => (
        <Card key={donor.id} mode="outlined" style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">{donor.name}</Text>
            <Text>{donor.category}</Text>
            <Text>{donor.contactNumber}</Text>
          </Card.Content>
        </Card>
      ))}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  input: { marginTop: 12 },
  button: { marginTop: 12 },
});
