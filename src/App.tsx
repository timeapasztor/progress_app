import React, { useEffect, useRef, useState } from "react";
import {
  ApplicationWrapper,
  ActionsWrapper,
  ProgressWrapper,
  ListWrapper,
  FlowWrapper,
  Circle,
  CategoryWrapper,
  CircleNumber,
  Category,
} from "./style/App.css";
import { Input, Button, Form, Select, Checkbox, Modal } from "antd";
import { generateUID, snakeCase } from "./utils/helper";
import { JSX } from "react/jsx-runtime";
import { CheckOutlined } from "@ant-design/icons";
import { RuleObject } from "rc-field-form/lib/interface";
import Api from "./api/Api";

type FieldType = {
  category?: string;
  task?: string;
  field?: string;
  checkbox?: boolean;
};

type TaskType = {
  task?: string;
  key?: string;
};

const { Option } = Select;

const App: React.FC = () => {
  const [progressList, setProgressList] = useState<any[]>([]);
  const completedCategoryI = useRef<any>();

  const [categories, setCategories] = useState<string[]>([]);
  const [tasks, setTasks] = useState<TaskType[]>([]);

  const [selectedAddCategory, setSelectedAddCategory] = useState<string>();

  const [selectedRemoveCatTask, setSelectedRemoveCatTask] = useState<string>();
  const [selectedRemoveTask, setSelectedRemoveTask] = useState<string>();

  const [selectedReopenCatTask, setSelectedReopenCatTask] = useState<string>();
  const [selectedReopenTask, setSelectedReopenTask] = useState<string>();
  const [agreeChecked, setAgreeChecked] = useState(false);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [randomFact, setRandomFact] = useState<string>("");
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  const [formAddCategory] = Form.useForm();
  const [formAddTask] = Form.useForm();
  const [formRemoveTask] = Form.useForm();
  const [formReopenTask] = Form.useForm();

  useEffect(() => {
    if (localStorage.getItem("progress")) {
      let data = JSON.parse(`${localStorage.getItem("progress")}`);
      if (data) {
        setProgressList(data);
      }
    }
  }, []);

  useEffect(() => {
    // enable next category
    if (typeof completedCategoryI.current == "number") {
      const list = progressList?.map((category: any, index: number) => {
        if (completedCategoryI.current + 1 === index) {
          const newCat = { ...category };
          const keyCat = Object.keys(newCat)[0];
          const item = { ...newCat[keyCat] };
          for (const i in item) {
            if (i === "disabled") {
              item[i] = false;
            }
          }
          const newItem = {
            [keyCat]: item,
          };
          return newItem;
        } else {
          return category;
        }
      });
      setProgressList(list);
    }
  }, [completedCategoryI.current]);

  const isCategoryCompleted = (category: string, index: number) => {
    const helper: boolean[] = [];

    progressList &&
      progressList.length &&
      progressList.forEach((item: any) => {
        const newCat = { ...item };
        const keyCat = Object.keys(newCat)[0];
        if (keyCat === snakeCase(category)) {
          for (const i in newCat[keyCat]) {
            if (Object.keys(newCat[keyCat]).length > 1) {
              if (i !== "disabled") {
                if (newCat[keyCat][i] === true) {
                  helper.push(true);
                } else {
                  helper.push(false);
                }
              }
            } else {
              helper.push(false);
            }
          }
        }
      });
    const isCompleted = helper.every((value) => value === true);
    if (isCompleted) {
      completedCategoryI.current = index;
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    // is it all completed?
    const helper: boolean[] = [];
    categories?.length > 0 &&
      categories?.forEach((category: string, index: number) => {
        const isCompleted = isCategoryCompleted(category, index);
        helper.push(isCompleted);
      });
    const isCompleted = helper.every((value) => value === true);
    if (progressList.length > 0 && isCompleted) {
      setShowModal(true);
    }
    if (window.localStorage) {
      window.localStorage.setItem("progress", JSON.stringify(progressList));
    }
  }, [progressList]);

  const getRandomFact = async () => {
    try {
      setConfirmLoading(true);
      const result = await Api.fetchRandomFact();
      if (result) {
        setRandomFact(result?.text);
        setConfirmLoading(false);
      }
    } catch (error) {
      console.error(error, "Failed to fetch.");
    }
  };

  useEffect(() => {
    if (showModal) {
      getRandomFact();
    }
  }, [showModal]);

  const isCategoryDisabled = (category: string) => {
    let helper: boolean = false;
    progressList &&
      progressList?.forEach((item: any) => {
        const newCat = { ...item };
        const keyCat = Object.keys(newCat)[0];
        if (keyCat === snakeCase(category)) {
          for (const i in newCat[keyCat]) {
            if (i === "disabled") {
              if (newCat[keyCat][i] === true) {
                helper = true;
              } else {
                helper = false;
              }
            }
          }
        }
      });
    return helper;
  };

  const handleOnChangeCheckbox = (e: any, key: string) => {
    const newList = progressList.map((category: any) => {
      const newCat = { ...category };
      const keyNewCat = Object.keys(newCat)[0];
      for (const i in newCat[keyNewCat]) {
        if (i === key) {
          newCat[keyNewCat][i] = e.target.checked;
        }
      }
      return newCat;
    });
    setProgressList(newList);
  };

  const handleSelectChange = (item: any, key: string) => {
    switch (key) {
      case "addCat":
        return setSelectedAddCategory(item);
      case "removeCatTask":
        return setSelectedRemoveCatTask(item);
      case "removeTask":
        return setSelectedRemoveTask(item);
      case "reopenCatTask":
        return setSelectedReopenCatTask(item);
      case "reopenTask":
        return setSelectedReopenTask(item);
      case "reopenAgreeCheckbox":
        formReopenTask.validateFields(["checkbox"]);
        return setAgreeChecked(item?.target?.checked);
    }
  };

  const renderAddCategories = () => {
    const values: string[] = [];
    const categoriesList: JSX.Element[] = [];
    if (categories?.length > 0) {
      categories?.forEach((category: string, index: number) => {
        const isCompleted = isCategoryCompleted(category, index);
        progressList?.length > 0 &&
          progressList.forEach((categoryP: any) => {
            const newCat = { ...categoryP };
            const keyNewCat = Object.keys(newCat)[0];
            const newItem = { ...newCat[keyNewCat] };
            if (keyNewCat === snakeCase(category)) {
              // checking if object is disabled and has tasks
              if (newItem.disabled === false) {
                if (!isCompleted) {
                  values.push(category);
                }
              } else {
                if (Object.keys(newItem).length >= 1) {
                  values.push(category);
                }
              }
            }
          });
      });
    }
    values.forEach((value) => {
      categoriesList.push(
        <Option key={generateUID(16)} value={value}>
          {value}
        </Option>
      );
    });
    return categoriesList;
  };

  const renderRemoveCategories = () => {
    const values: string[] = [];
    const categoriesList: JSX.Element[] = [];
    if (categories?.length > 0) {
      categories?.forEach((category: string, index: number) => {
        const isCompleted = isCategoryCompleted(category, index);
        progressList?.length > 0 &&
          progressList.forEach((categoryP: any) => {
            const newCat = { ...categoryP };
            const keyNewCat = Object.keys(newCat)[0];
            const newItem = { ...newCat[keyNewCat] };
            if (keyNewCat === snakeCase(category)) {
              // checking if object is disabled and has tasks
              if (
                !isCompleted &&
                newItem.disabled === false &&
                Object.keys(newItem).length > 1
              ) {
                values.push(category);
              }
            }
          });
      });
    }
    values.forEach((value) => {
      categoriesList.push(
        <Option key={generateUID(16)} value={value}>
          {value}
        </Option>
      );
    });
    return categoriesList;
  };

  const renderCompletedCategories = () => {
    const values: string[] = [];
    const helper: boolean[] = [];
    const categoriesList: JSX.Element[] = [];
    if (categories?.length > 0) {
      categories?.forEach((category) => {
        progressList?.length > 0 &&
          progressList.forEach((categoryP: any) => {
            const newCat = { ...categoryP };
            const keyCat = Object.keys(newCat)[0];
            if (keyCat === snakeCase(category)) {
              for (const i in newCat[keyCat]) {
                if (Object.keys(newCat[keyCat]).length > 1) {
                  if (i !== "disabled") {
                    if (newCat[keyCat][i] === true) {
                      helper.push(true);
                    } else {
                      helper.push(false);
                    }
                  }
                } else {
                  helper.push(false);
                }
              }
            }
          });
        const isCompleted = helper.every((value) => value === true);
        if (isCompleted) {
          values.push(category);
        }
      });
    }
    values.forEach((value) => {
      categoriesList.push(
        <Option key={generateUID(16)} value={value}>
          {value}
        </Option>
      );
    });
    return categoriesList;
  };

  const renderNotCompletedTasks = () => {
    const values: string[] = [];
    const taskLabels: string[] = [];
    const tasksList: JSX.Element[] = [];
    // if the category is disabled it means it is not completed fully, so check for the tasks with false value
    progressList?.length > 0 &&
      progressList.forEach((categoryP: any) => {
        const newCat = { ...categoryP };
        const keyNewCat = Object.keys(newCat)[0];
        const newItem = { ...newCat[keyNewCat] };
        // filetered by selected remove category
        if (
          selectedRemoveCatTask &&
          keyNewCat === snakeCase(selectedRemoveCatTask)
        ) {
          if (newItem.disabled === false) {
            for (const key in newItem) {
              if (newItem[key] === false && key !== "disabled") {
                values.push(key);
              }
            }
          }
        }
      });
    // filter not completed tasks by category
    values?.forEach((value) => {
      tasks?.forEach((task: TaskType) => {
        if (task && task?.task) {
          if (value === task?.key) {
            taskLabels.push(task.task);
          }
        }
      });
    });
    taskLabels.forEach((label) => {
      tasksList.push(
        <Option key={generateUID(16)} value={label}>
          {label}
        </Option>
      );
    });
    return tasksList;
  };

  const onFinishAddCategory = (e: { category: string }) => {
    const value = e ? e?.category : "";
    const snake_key = snakeCase(value) || "";
    //check if there is already one category set, then the next ones to be disabled
    if (progressList?.length > 0) {
      const newCat = {
        [snake_key]: {
          disabled: true,
        },
      };
      setProgressList((prevState: any[]) => {
        const newItem = [...prevState, newCat];
        return newItem;
      });
    }
    if (progressList?.length === 0) {
      const newCat = {
        [snake_key]: {
          disabled: false,
        },
      };
      setProgressList((prevState: any[]) => {
        const newItem = [...prevState, newCat];
        return newItem;
      });
    }
    setCategories((prevState) => {
      const newItem = [...prevState, value];
      return newItem;
    });
    formAddCategory.resetFields();
  };

  const renderAddCategory = () => {
    return (
      <Form
        form={formAddCategory}
        layout="inline"
        name="addCategory"
        style={{ paddingBottom: "10px" }}
        onFinish={onFinishAddCategory}
        autoComplete="off"
      >
        <Form.Item<FieldType>
          label="Category"
          name="category"
          rules={[{ required: true, message: "Please input a category!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Add
          </Button>
        </Form.Item>
      </Form>
    );
  };

  const onFinishAddTask = (e: { task: string }) => {
    const value = e ? e?.task : "";
    const snake_key = snakeCase(value) || "";
    const selected: string = snakeCase(selectedAddCategory as string) || "";
    // iterate through the list, find the object where the key is equal to the selected and save there
    if (progressList?.length > 0) {
      const newList = progressList?.map((category: any) => {
        const newCat = { ...category };
        if (newCat.hasOwnProperty(selected)) {
          const newItem = { ...newCat[selected] };
          newItem[`${snake_key}`] = false;
          const newCatgeory = {
            [`${selected}`]: newItem,
          };
          return newCatgeory;
        } else {
          return category;
        }
      });
      setProgressList(newList);
    }
    const newTask = {
      task: value,
      key: snake_key,
    };
    const taskList = [...tasks];
    taskList.push(newTask);
    setTasks(taskList);
    formAddTask.resetFields();
    setSelectedAddCategory("");
  };

  const renderAddTask = () => {
    return (
      <Form
        form={formAddTask}
        layout="inline"
        name="addTask"
        style={{ paddingBottom: "10px" }}
        onFinish={onFinishAddTask}
        autoComplete="off"
      >
        <Form.Item<FieldType>
          label="Category"
          name="category"
          rules={[{ required: true, message: "Please select a category!" }]}
        >
          <Select
            value={selectedAddCategory}
            style={{ width: "175px", margin: "0 8px" }}
            onChange={(e) => handleSelectChange(e, "addCat")}
          >
            {renderAddCategories()}
          </Select>
        </Form.Item>

        <Form.Item<FieldType>
          label="Task"
          name="task"
          rules={[{ required: true, message: "Please input a task!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Add
          </Button>
        </Form.Item>
      </Form>
    );
  };

  const onFinishRemoveTask = (e: { category: string; task: string }) => {
    const tasksHelper: TaskType[] = [];
    const removeTask = e ? e?.task : "";
    const snake_key = snakeCase(removeTask) || "";
    const selectedCat: string =
      snakeCase(selectedRemoveCatTask as string) || "";
    // iterate through the list, find the object where the key is equal to the selected and save there
    if (progressList.length > 0) {
      const newList = progressList.map((category: any) => {
        const newCat = { ...category };
        if (newCat.hasOwnProperty(selectedCat)) {
          const item = { ...newCat[selectedCat] };
          delete item[`${snake_key}`];
          // removing just the selected task from the category
          const newCategory = {
            [`${selectedCat}`]: item,
          };
          return newCategory;
        } else {
          return category;
        }
      });
      setProgressList(newList);
    }
    // removing task from the helper tasks list state
    tasks?.forEach((elem: TaskType) => {
      if (elem.task !== removeTask) {
        tasksHelper.push(elem);
      }
    });
    setTasks(tasksHelper);
    formRemoveTask.resetFields();
    setSelectedRemoveCatTask("");
    setSelectedRemoveTask("");
  };

  const renderRemoveTask = () => {
    return (
      <Form
        form={formRemoveTask}
        layout="inline"
        name="removeTask"
        style={{ paddingBottom: "10px" }}
        onFinish={onFinishRemoveTask}
        autoComplete="off"
      >
        <Form.Item<FieldType>
          label="Category"
          name="category"
          rules={[{ required: true, message: "Please select a category!" }]}
        >
          <Select
            value={selectedRemoveCatTask}
            style={{ width: "175px", margin: "0 8px" }}
            onChange={(e) => handleSelectChange(e, "removeCatTask")}
          >
            {renderRemoveCategories()}
          </Select>
        </Form.Item>

        <Form.Item<FieldType>
          label="Task"
          name="task"
          rules={[{ required: true, message: "Please select a task!" }]}
        >
          <Select
            value={selectedRemoveTask}
            style={{ width: "175px", margin: "0 8px" }}
            onChange={(e) => handleSelectChange(e, "removeTask")}
          >
            {renderNotCompletedTasks()}
          </Select>
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Remove
          </Button>
        </Form.Item>
      </Form>
    );
  };

  const renderTasksToCategory = (
    category: string,
    isCompleted: boolean,
    isDisabled: boolean
  ) => {
    const helper: any[] = [];
    progressList &&
      progressList.length &&
      progressList.forEach((item: any, index: number) => {
        const newCat = { ...item };
        const keyCat = Object.keys(newCat)[0];
        if (keyCat === snakeCase(category)) {
          for (const i in newCat[keyCat]) {
            if (i !== "disabled") {
              // find the task label in the task list
              const taskLabel = tasks.filter((elem) => elem.key === i);
              const disabledField = (
                <div key={generateUID(16)}>
                  <input
                    type="checkbox"
                    id={taskLabel[0]?.task}
                    name={taskLabel[0]?.task}
                    checked={newCat[keyCat][i]}
                    value={newCat[keyCat][i]}
                    onChange={(e) => handleOnChangeCheckbox(e, i)}
                    disabled={false}
                  />
                  <label htmlFor={taskLabel[0]?.task}>
                    {taskLabel[0]?.task}
                  </label>
                </div>
              );
              const enabledField = (
                <div key={generateUID(16)}>
                  <input
                    type="checkbox"
                    id={taskLabel[0]?.task}
                    name={taskLabel[0]?.task}
                    checked={newCat[keyCat][i]}
                    value={newCat[keyCat][i]}
                    onChange={(e) => handleOnChangeCheckbox(e, i)}
                    disabled={true}
                  />
                  <label htmlFor={taskLabel[0]?.task}>
                    {taskLabel[0]?.task}
                  </label>
                </div>
              );
              if (isCompleted) {
                helper.push(enabledField);
              } else {
                if (completedCategoryI === undefined) {
                  if ((index = 0)) {
                    helper.push(disabledField);
                  }
                  if (index > 0) {
                    helper.push(enabledField);
                  }
                }
                if (
                  completedCategoryI &&
                  completedCategoryI.current &&
                  completedCategoryI.current + 1 === index
                ) {
                  helper.push(disabledField);
                } else {
                  helper.push(
                    <div key={generateUID(16)}>
                      <input
                        type="checkbox"
                        id={taskLabel[0]?.task}
                        name={taskLabel[0]?.task}
                        checked={newCat[keyCat][i]}
                        value={newCat[keyCat][i]}
                        onChange={(e) => handleOnChangeCheckbox(e, i)}
                        disabled={isDisabled}
                      />
                      <label htmlFor={taskLabel[0]?.task}>
                        {taskLabel[0]?.task}
                      </label>
                    </div>
                  );
                }
              }
            }
          }
        }
      });
    return helper;
  };

  const renderTasks = () => {
    const values: string[] = [];
    const taskLabels: string[] = [];
    const tasksList: JSX.Element[] = [];
    progressList?.length > 0 &&
      progressList.forEach((categoryP: any) => {
        const newCat = { ...categoryP };
        const keyNewCat = Object.keys(newCat)[0];
        const newItem = { ...newCat[keyNewCat] };
        // filetered by selected remove category
        if (
          selectedReopenCatTask &&
          keyNewCat === snakeCase(selectedReopenCatTask)
        ) {
          // it is locked
          if (newItem.disabled === false) {
            for (const key in newItem) {
              if (newItem[key] === true && key !== "disabled") {
                values.push(key);
              }
            }
          }
        }
      });
    // filter not completed tasks by category
    values?.forEach((value) => {
      tasks?.forEach((task: TaskType) => {
        if (task && task?.task) {
          if (value === task?.key) {
            taskLabels.push(task.task);
          }
        }
      });
    });
    taskLabels.forEach((label) => {
      tasksList.push(
        <Option key={generateUID(16)} value={label}>
          {label}
        </Option>
      );
    });
    return tasksList;
  };

  const getSelectedCatI = (category: string) => {
    let indexCat = 0;
    progressList.length &&
      progressList.forEach((item: any, index: number) => {
        const newCat = { ...item };
        const keyNewCat = Object.keys(newCat)[0];
        if (keyNewCat === snakeCase(category)) {
          indexCat = index;
        }
      });
    return indexCat;
  };

  const getSelectedTaskI = (indexCat: number) => {
    let indexTask: any;
    const selectedCat: string =
      snakeCase(selectedReopenCatTask as string) || "";
    const selectedTask: string = snakeCase(selectedReopenTask as string) || "";
    progressList.length &&
      progressList.forEach((category: any, index: number) => {
        const newCat = { ...category };
        if (index === indexCat) {
          if (newCat.hasOwnProperty(selectedCat)) {
            const item = { ...newCat[selectedCat] };
            let count = 0;
            for (const i in item) {
              count++;
              if (selectedTask === i) {
                indexTask = count;
              }
            }
          }
        }
      });
    return indexTask;
  };

  const onFinishReopenTask = (e: {
    category: string;
    task: string;
    checkbox: undefined;
  }) => {
    const indexCat = getSelectedCatI(e.category);
    const indexTask = getSelectedTaskI(indexCat);
    const newList =
      progressList.length &&
      progressList.map((category: any, index: number) => {
        const newCat = { ...category };
        const keyNewCat = Object.keys(newCat)[0];
        const item = { ...newCat[keyNewCat] };
        // iterate through item and reopen task
        if (index === indexCat) {
          // reopen from taskIndex
          const keys = Object.keys(item);
          const filteredKeys = keys.slice(indexTask - 1);
          filteredKeys.length &&
            filteredKeys.forEach((key: string) => {
              for (const i in item) {
                if (i === key) {
                  item[key] = false;
                }
              }
            });
          const newCategory = {
            [`${keyNewCat}`]: item,
          };
          return newCategory;
        }
        if (index > indexCat) {
          for (const i in item) {
            if (i === "disabled") {
              item[i] = true;
            }
            if (i !== "disabled") {
              item[i] = false;
            }
          }
          const newCategory = {
            [`${keyNewCat}`]: item,
          };
          return newCategory;
        }
        if (index < indexCat) {
          return category;
        }
      });
    completedCategoryI.current = indexCat - 1;
    setProgressList(newList as any[]);
    formReopenTask.resetFields();
    setAgreeChecked(false);
    setSelectedReopenCatTask("");
    setSelectedReopenTask("");
  };

  const validation = (
    rule: RuleObject,
    value: any,
    callback: (error?: string) => void
  ) => {
    if (agreeChecked) {
      return callback();
    }
    return callback(
      "Please accept the terms and conditions, check the checkbox in order to reopen category."
    );
  };

  const renderReopenTask = () => {
    return (
      <Form
        form={formReopenTask}
        layout="inline"
        name="reopenTask"
        style={{ paddingBottom: "10px" }}
        onFinish={onFinishReopenTask}
        autoComplete="off"
      >
        <Form.Item<FieldType>
          label="Category"
          name="category"
          rules={[{ required: true, message: "Please select a category!" }]}
        >
          <Select
            value={selectedReopenCatTask}
            style={{ width: "175px", margin: "0 8px" }}
            onChange={(e) => handleSelectChange(e, "reopenCatTask")}
          >
            {/* {renderIncompleteTaskCategories()} */}
            {renderCompletedCategories()}
          </Select>
        </Form.Item>

        <Form.Item<FieldType>
          label="Task"
          name="task"
          rules={[{ required: true, message: "Please select a task!" }]}
        >
          <Select
            value={selectedReopenTask}
            style={{ width: "175px", margin: "0 8px" }}
            onChange={(e) => handleSelectChange(e, "reopenTask")}
          >
            {renderTasks()}
          </Select>
        </Form.Item>

        <Form.Item<FieldType>
          label="Checkbox"
          name="checkbox"
          valuePropName="checkbox"
          rules={[{ validator: validation }]}
        >
          <Checkbox
            value={agreeChecked}
            checked={agreeChecked}
            onChange={(e) => handleSelectChange(e, "reopenAgreeCheckbox")}
          >
            I agree, that all categories (up until the selected one) will be
            reopened, this change might be affecting them.
          </Checkbox>
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Reopen
          </Button>
        </Form.Item>
      </Form>
    );
  };

  const renderProgress = () => {
    const list: any[] = [];
    categories &&
      categories?.length &&
      categories?.forEach((category: string, index: number) => {
        const isCompleted = isCategoryCompleted(category, index);
        const isDisabled = isCategoryDisabled(category);
        list.push(
          <ListWrapper key={category}>
            <h1 key={generateUID(16)}>
              <CategoryWrapper>
                <Circle>
                  <CircleNumber>{index + 1}</CircleNumber>
                </Circle>
                <Category>{category}</Category>
                {isCompleted && <CheckOutlined />}
              </CategoryWrapper>
            </h1>
            {renderTasksToCategory(category, isCompleted, isDisabled)}
          </ListWrapper>
        );
      });
    return <FlowWrapper>{list}</FlowWrapper>;
  };

  const handleOkClick = () => {
    setShowModal(false);
  };

  const handleCancelClick = () => {
    setShowModal(false);
  };

  const renderFact = () => {
    return <div>{randomFact}</div>;
  };

  return (
    <ApplicationWrapper id={"app"}>
      <ActionsWrapper>
        <h1 data-testid="add">Add</h1>
        {renderAddCategory()}
        {renderAddTask()}

        <h1 data-testid="remove">Remove</h1>
        {renderRemoveTask()}

        <h1 data-testid="reopen">Reopen</h1>
        {renderReopenTask()}
      </ActionsWrapper>
      <ProgressWrapper>{renderProgress()}</ProgressWrapper>
      {showModal && (
        <Modal
          title={"Flow is finished."}
          open={showModal}
          onOk={handleOkClick}
          confirmLoading={confirmLoading}
          onCancel={handleCancelClick}
          centered
          focusTriggerAfterClose={false}
        >
          {renderFact()}
        </Modal>
      )}
    </ApplicationWrapper>
  );
};

export default App;
