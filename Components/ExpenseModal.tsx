import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Button,
  Platform,
  Modal,
} from "react-native";
import uuid from "react-native-uuid";
import { DatePickerModal } from "react-native-paper-dates"; //date picker for web
import { AntDesign, Feather } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { GlobalStateType, ExpenseType } from "../Utils/types";
import { addExpense, editExpense } from "../Utils/expenseSlice";
import { recalculateBudget } from "../Utils/remainingBudgetSlice";
import { setModalMode,setExpenseModalVisibility } from "../Utils/appSlice";
import DateTimePickerModal from "react-native-modal-datetime-picker"; //date picker for android/ios
interface Props {
  amount: number;
  setAmount: React.Dispatch<React.SetStateAction<number>>;
  label: string;
  setLabel: React.Dispatch<React.SetStateAction<string>>;
  expense: ExpenseType;
}
const ExpenseModal = ({
  amount,
  setAmount,
  label,
  setLabel,
  expense,
}: Props) => {
  const [date, setDate] = useState(0);
  const [open, setOpen] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const accounts = useSelector((state: GlobalStateType) => state.accounts.list);
  const expenses = useSelector((state: GlobalStateType) => state.expenses.list);
  const appData = useSelector((state: GlobalStateType) => state.app);
  const dispatch = useDispatch();
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };
  const onDismissSingle = useCallback(() => {
    setOpen(false);
  }, [setOpen]);
  const onConfirmSingle = useCallback(
    (params) => {
      setOpen(false);
      setDate(params.date);
    },
    [setOpen, setDate]
  );
  const handleConfirm = (date: Date) => {
    setDate(Number(date));
    hideDatePicker();
    onDismissSingle;
  };
  const onChangeTextAmount = (number: any) => {
    let newText: any = "";
    let newNumber = "0123456789.";
    for (let i = 0; i < number.length; i++) {
      if (newNumber.indexOf(number[i]) > -1) {
        newText = newText + number[i];
      } else {
        alert("please enter number values only");
      }
    }
    setAmount(Number(newText));
  };
  const runAddExpense = () => {
    if (label.length > 0 && amount > 0) {
      setLabel(label);
      setAmount(amount);
      const newExpense = {
        label: label,
        saved: amount,
        goal: amount,
        date: date > 0 ? Number(date) : Date.now(),
        id: uuid.v4().toString(),
      };
      dispatch(addExpense(newExpense));
      dispatch(
        recalculateBudget({
          expenses: [...expenses, newExpense],
          accounts: accounts,
        })
      );
      dispatch(setExpenseModalVisibility(false));
    } else {
      alert("There is an empty value in one of the inputs");
    }
  };
  const runEditExpense = () => {
    const expenseUpdate: ExpenseType = {
      ...expense,
      label: label,
      saved: amount,
      goal: expense.goal,
      date: expense.date,
      id: expense.id,
    };
    const updateExpense = expenses.map((exp)=>
    exp.id === expenseUpdate.id? expenseUpdate:exp);
    dispatch(editExpense(updateExpense));
    dispatch(setExpenseModalVisibility(false));
    dispatch(
      recalculateBudget({
        accounts: accounts,
        expenses: updateExpense
      })
    );
  };
  return (
    <View style={styles.container}>
      <Modal 
	  visible={appData?.expenseModalVisibility} 
	  transparent={true}>
        {/* This is where the Form starts */}
        <View style={styles.modalSize}>
          <View style={styles.titleContainer}>
            <View style={{ alignSelf: "flex-end" }}>
              <TouchableOpacity
                style={styles.xIcon}
                onPress={() => {
                  dispatch(
                    setExpenseModalVisibility(false)
                  );
                }}
              >
                <Feather
                  name="x-circle"
                  size={30}
                  color="black"
                  style={{ paddingRight: 10 }}
                />
              </TouchableOpacity>
            </View>
            <View>
              <Text style={styles.titleText}>
                {appData?.modalMode === "add" ? "Add Expense" : "Update Expense"}
              </Text>
            </View>
          </View>
          <View style={styles.subContainer}>
            <Text style={[styles.textContainer, { paddingRight: 40 }]}>
              Label:
            </Text>
            <TextInput
              style={styles.inputStyle}
              value={label}
              onChangeText={(text) => {
                setLabel(text);
              }}
            />
          </View>
          <View style={styles.subContainer}>
            <Text style={[styles.textContainer, { paddingRight: 20 }]}>
              Amount:
            </Text>
            <TextInput
              style={styles.inputStyle}
              value={appData?.modalMode !== "add" ? amount?.toString() : undefined}
              onChangeText={(number) => onChangeTextAmount(number)}
            />
          </View>
          <View style={styles.subContainer}>
            <Text style={[styles.textContainer, { paddingRight: 5 }]}>
              Due Date:
            </Text>
            {Platform.OS === "web" ? (
              <View>
                <Button title="Pick the date" onPress={() => setOpen(true)} />
                <DatePickerModal
                  locale="en"
                  mode="single"
                  visible={open}
                  onDismiss={onDismissSingle}
                  date={new Date()}
                  onConfirm={onConfirmSingle}
                />
              </View>
            ) : (
              <View>
                <Button title="Pick the date" onPress={showDatePicker} />
                <DateTimePickerModal
                  isVisible={isDatePickerVisible}
                  mode="date"
                  onConfirm={handleConfirm}
                  onCancel={hideDatePicker}
                />
              </View>
            )}
          </View>
          {appData?.modalMode === "add" ? (
            <TouchableOpacity
              onPress={() => {
                runAddExpense();
                setLabel("");
                setAmount(0);
                setDate(0);
                dispatch(setExpenseModalVisibility(false));
              }}
              style={styles.buttonStyle}
            >
              <Text style={{ fontSize: 16 }}>Confirm</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                runEditExpense();
                setLabel("");
                setAmount(0);
                setDate(0);
                dispatch(setExpenseModalVisibility(false));
              }}
              style={styles.buttonStyle}
            >
              <Text style={{ fontSize: 16 }}>Update</Text>
            </TouchableOpacity>
          )}

          {/* This is where the form ends */}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    alignItems: "center",
    paddingBottom: 30,
  },
  titleText: {
    fontSize: 25,
  },
  inputStyle: {
    width: 150,
    height: 30,
    borderWidth: 1,
    borderColor: "#000",
    fontSize: 20,
    fontWeight: "bold",
    backgroundColor: "#fff",
    paddingLeft: 10,
  },
  xIcon: {
    alignSelf: "flex-end",
  },
  buttonStyle: {
    alignSelf: "center",
    width: 80,
    height: 40,
    padding: 10,
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#828282",
  },
  subContainer: {
    flexDirection: "row",
    paddingBottom: 10,
  },
  textContainer: {
    paddingLeft: 20,
    fontSize: 20,
  },
  modalSize: {
    justifyContent: "center",
    alignSelf: "center",
    width: 350,
    height: 300,
    borderWidth: 1,
    borderRadius: 20,
    marginTop: 210,
    padding: 10,
    borderColor: "#000",
    backgroundColor: "#DADADA",
  },
});

export default ExpenseModal;
