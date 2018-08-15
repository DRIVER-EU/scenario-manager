export interface ITree<T> {
  children: Array<T & ITree<T>>;
}
