CREATE TABLE Defects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  location VARCHAR(255),
  defect_description TEXT,
  defect_category VARCHAR(50),
  elimination_method VARCHAR(255),
  photo VARCHAR(255),
  tag_link TEXT
)