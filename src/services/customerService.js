import api from "./axiosClient";

export const getCustomersGeoJSON = () => {
  return api.getCustomers();
};

export const createCustomer = (payload) => {
  return api.createCustomer(payload);
};

export const updateCustomer = (id, payload) => {
  return api.updateCustomer(id, payload);
};

export const deleteCustomer = (id) => {
  return api.deleteCustomer(id);
};