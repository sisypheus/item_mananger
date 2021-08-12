package com.manager.item_manager.repository;

import java.util.List;

import com.manager.item_manager.model.Item;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

@Repository
public interface ItemRepository extends MongoRepository<Item, String> {
  List<Item> findByCategory(String category);
  @Query("{ 'name' : {$regex: ?0} }")
  List<Item> findItemsByRegexName(String regexp);
}
